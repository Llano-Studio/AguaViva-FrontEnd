#!/bin/bash

# Script de Deployment para DigitalOcean - Sgarav Frontend App
# Uso: ./deploy-digitalocean.sh [setup|deploy|ssl|backup|monitor]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ACTION=${1:-deploy}
APP_NAME="sgarav-frontend"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Banner
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║     DigitalOcean Deployment Tool     ║"
    echo "║        Sgarav Frontend App           ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [acción] [opciones]"
    echo ""
    echo "Acciones disponibles:"
    echo "  setup     - Configuración inicial del servidor"
    echo "  deploy    - Deploy de la aplicación (default)"
    echo "  ssl       - Configurar SSL con Let's Encrypt"
    echo "  backup    - Crear backup de la aplicación"
    echo "  monitor   - Ver estado y logs"
    echo "  update    - Actualizar aplicación"
    echo "  --help    - Mostrar esta ayuda"
    echo ""
}

# Verificar si es root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        echo -e "${RED}❌ No ejecutes este script como root${NC}"
        echo "Usa un usuario con permisos sudo en su lugar"
        exit 1
    fi
}

# Verificar si estamos en DigitalOcean
check_digitalocean() {
    if command -v dmidecode &> /dev/null; then
        if dmidecode -s system-manufacturer 2>/dev/null | grep -i "digitalocean" &> /dev/null; then
            echo -e "${GREEN}✅ Detectado droplet de DigitalOcean${NC}"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}⚠️  No se detectó DigitalOcean, continuando...${NC}"
    return 0
}

# Configuración inicial del servidor
setup_server() {
    echo -e "${YELLOW}🔧 Configurando servidor DigitalOcean...${NC}"
    
    # Actualizar sistema
    echo -e "${YELLOW}📦 Actualizando sistema...${NC}"
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependencias esenciales
    echo -e "${YELLOW}🛠️  Instalando dependencias...${NC}"
    sudo apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        wget \
        unzip \
        htop \
        nginx-extras \
        ufw
    
    # Instalar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker $USER
        echo -e "${GREEN}✅ Docker instalado${NC}"
    fi
    
    # Instalar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}🔧 Instalando Docker Compose...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo -e "${GREEN}✅ Docker Compose instalado${NC}"
    fi
    
    # Configurar firewall
    echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    # Crear directorios necesarios
    mkdir -p logs ssl backups
    
    # Configurar archivo de entorno
    if [[ ! -f "$ENV_FILE" ]]; then
        cp env.production.example $ENV_FILE
        echo -e "${YELLOW}⚙️  Archivo .env creado. Modifica las variables según tu configuración.${NC}"
    fi
    
    echo -e "${GREEN}✅ Servidor configurado correctamente${NC}"
    echo -e "${YELLOW}📝 Recuerda: Cierra sesión y vuelve a conectarte para que los cambios de Docker surtan efecto${NC}"
}

# SSL con Let's Encrypt
setup_ssl() {
    echo -e "${YELLOW}🔒 Configurando SSL con Let's Encrypt...${NC}"
    
    if [[ ! -f "$ENV_FILE" ]]; then
        echo -e "${RED}❌ Archivo .env no encontrado${NC}"
        echo "Ejecuta primero: ./deploy-digitalocean.sh setup"
        exit 1
    fi
    
    source $ENV_FILE
    
    if [[ -z "$DOMAIN_NAME" || "$DOMAIN_NAME" == "tu-dominio.com" ]]; then
        echo -e "${RED}❌ DOMAIN_NAME no configurado en .env${NC}"
        exit 1
    fi
    
    # Instalar certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Obtener certificado
    sudo certbot --nginx -d $DOMAIN_NAME --email $SSL_EMAIL --agree-tos --non-interactive
    
    # Configurar renovación automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo -e "${GREEN}✅ SSL configurado correctamente${NC}"
}

# Función para deploy
deploy_app() {
    echo -e "${YELLOW}🚀 Desplegando aplicación...${NC}"
    
    # Verificar archivo .env
    if [[ ! -f "$ENV_FILE" ]]; then
        echo -e "${YELLOW}⚠️  Archivo .env no encontrado, usando configuración por defecto${NC}"
    fi
    
    # Parar contenedores existentes
    echo -e "${YELLOW}🛑 Parando contenedores existentes...${NC}"
    docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # Limpiar imágenes huérfanas
    docker image prune -f
    
    # Build y deploy
    echo -e "${YELLOW}🔨 Construyendo imagen...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    echo -e "${YELLOW}🚢 Iniciando contenedores...${NC}"
    docker-compose -f $COMPOSE_FILE up -d
    
    # Esperar health check
    echo -e "${YELLOW}🏥 Esperando health check...${NC}"
    sleep 15
    
    # Verificar estado
    if docker ps | grep -q $APP_NAME; then
        echo -e "${GREEN}✅ Deployment exitoso!${NC}"
        
        # Mostrar información
        local_ip=$(hostname -I | awk '{print $1}')
        echo -e "${GREEN}🌐 Aplicación disponible en:${NC}"
        echo -e "   Local: http://$local_ip"
        
        if [[ -f "$ENV_FILE" ]]; then
            source $ENV_FILE
            if [[ -n "$DOMAIN_NAME" && "$DOMAIN_NAME" != "tu-dominio.com" ]]; then
                echo -e "   Dominio: http://$DOMAIN_NAME"
            fi
        fi
        
        show_status
    else
        echo -e "${RED}❌ Error en el deployment${NC}"
        docker-compose -f $COMPOSE_FILE logs frontend
        exit 1
    fi
}

# Función para crear backup
create_backup() {
    echo -e "${YELLOW}💾 Creando backup...${NC}"
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/backup_$timestamp"
    
    mkdir -p $backup_dir
    
    # Backup de configuración
    cp $COMPOSE_FILE $backup_dir/
    cp nginx.conf $backup_dir/
    [[ -f "$ENV_FILE" ]] && cp $ENV_FILE $backup_dir/
    
    # Backup de logs
    if [[ -d "logs" ]]; then
        cp -r logs $backup_dir/
    fi
    
    # Crear tarball
    tar -czf "backups/sgarav_backup_$timestamp.tar.gz" -C backups "backup_$timestamp"
    rm -rf $backup_dir
    
    echo -e "${GREEN}✅ Backup creado: backups/sgarav_backup_$timestamp.tar.gz${NC}"
}

# Función para mostrar estado
show_status() {
    echo -e "${YELLOW}📊 Estado de la aplicación:${NC}"
    echo ""
    
    # Estado de contenedores
    echo -e "${BLUE}🐳 Contenedores:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    
    # Uso de recursos
    if docker ps | grep -q $APP_NAME; then
        echo -e "${BLUE}📈 Uso de recursos:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(CONTAINER|sgarav)"
        echo ""
        
        # Health check
        echo -e "${BLUE}🏥 Health Check:${NC}"
        if curl -sf http://localhost/health > /dev/null; then
            echo -e "${GREEN}✅ Aplicación saludable${NC}"
        else
            echo -e "${RED}❌ Aplicación con problemas${NC}"
        fi
        echo ""
        
        # Logs recientes
        echo -e "${BLUE}📋 Logs recientes:${NC}"
        docker-compose -f $COMPOSE_FILE logs --tail=10 frontend
    fi
}

# Función para actualizar
update_app() {
    echo -e "${YELLOW}🔄 Actualizando aplicación...${NC}"
    
    # Crear backup automático
    create_backup
    
    # Pull últimos cambios si es un repositorio git
    if [[ -d ".git" ]]; then
        echo -e "${YELLOW}📥 Descargando últimos cambios...${NC}"
        git pull origin main || git pull origin master
    fi
    
    # Redeploy
    deploy_app
}

# Función principal
main() {
    show_banner
    check_root
    check_digitalocean
    
    case $ACTION in
        "setup")
            setup_server
            ;;
        "deploy")
            deploy_app
            ;;
        "ssl")
            setup_ssl
            ;;
        "backup")
            create_backup
            ;;
        "monitor")
            show_status
            ;;
        "update")
            update_app
            ;;
        "--help")
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Acción no válida: $ACTION${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar
main 