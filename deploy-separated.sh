#!/bin/bash

# Script para deployment de proyectos separados - Frontend
# Para usar con backend NestJS separado

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Variables
ACTION=${1:-deploy}
FRONTEND_DIR=$(pwd)
BACKEND_DIR=${2:-../sgarav-backend}

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║        Deployment Proyectos Separados     ║"
echo "║         Frontend + Backend NestJS         ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [acción] [ruta_backend]"
    echo ""
    echo "Acciones:"
    echo "  deploy     - Deploy completo (default)"
    echo "  frontend   - Solo frontend"
    echo "  network    - Solo crear red compartida"
    echo "  status     - Ver estado de contenedores"
    echo "  logs       - Ver logs de aplicación"
    echo "  clean      - Limpiar contenedores parados"
    echo "  --help     - Mostrar ayuda"
    echo ""
    echo "Ejemplo:"
    echo "  $0 deploy ../mi-backend"
    echo "  $0 frontend"
    echo "  $0 status"
}

# Crear red compartida
create_network() {
    echo -e "${YELLOW}🔗 Configurando red compartida...${NC}"
    
    if docker network ls | grep -q sgarav-network; then
        echo -e "${GREEN}✅ Red sgarav-network ya existe${NC}"
    else
        docker network create sgarav-network --subnet=172.30.0.0/16
        echo -e "${GREEN}✅ Red sgarav-network creada${NC}"
    fi
}

# Deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}🎨 Desplegando frontend...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Parar contenedores existentes
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build y deploy
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    
    echo -e "${GREEN}✅ Frontend desplegado${NC}"
}

# Verificar backend
check_backend() {
    if [[ -d "$BACKEND_DIR" ]]; then
        echo -e "${GREEN}✅ Backend encontrado en: $BACKEND_DIR${NC}"
        
        if [[ -f "$BACKEND_DIR/docker-compose.yml" ]]; then
            echo -e "${GREEN}✅ Docker compose del backend encontrado${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️ No se encontró docker-compose.yml en el backend${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ Backend no encontrado en: $BACKEND_DIR${NC}"
        echo "Especifica la ruta correcta: $0 deploy /ruta/al/backend"
        return 1
    fi
}

# Deploy backend (si existe)
deploy_backend() {
    if check_backend; then
        echo -e "${YELLOW}⚙️ Desplegando backend...${NC}"
        
        cd "$BACKEND_DIR"
        
        # Parar contenedores existentes  
        docker-compose down 2>/dev/null || true
        
        # Build y deploy
        docker-compose build --no-cache
        docker-compose up -d
        
        echo -e "${GREEN}✅ Backend desplegado${NC}"
        cd "$FRONTEND_DIR"
    else
        echo -e "${YELLOW}⚠️ Saltando deployment del backend${NC}"
    fi
}

# Mostrar estado
show_status() {
    echo -e "${YELLOW}📊 Estado de contenedores:${NC}"
    echo ""
    
    # Buscar contenedores relacionados con sgarav
    containers=$(docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i sgarav || echo "No hay contenedores sgarav")
    echo "$containers"
    echo ""
    
    # Estado de la red
    echo -e "${YELLOW}🔗 Red compartida:${NC}"
    if docker network ls | grep -q sgarav-network; then
        echo -e "${GREEN}✅ sgarav-network activa${NC}"
        
        # Contenedores conectados
        connected=$(docker network inspect sgarav-network --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "ninguno")
        echo "Contenedores conectados: $connected"
    else
        echo -e "${RED}❌ sgarav-network no existe${NC}"
    fi
}

# Ver logs
show_logs() {
    echo -e "${YELLOW}📋 Logs de aplicación:${NC}"
    echo ""
    
    # Frontend logs
    if docker ps | grep -q sgarav-frontend; then
        echo -e "${BLUE}=== FRONTEND LOGS ===${NC}"
        docker logs sgarav-frontend --tail=10
        echo ""
    fi
    
    # Backend logs  
    if docker ps | grep -q sgarav-backend; then
        echo -e "${BLUE}=== BACKEND LOGS ===${NC}"
        docker logs sgarav-backend --tail=10
        echo ""
    fi
    
    # Database logs
    if docker ps | grep -q postgres; then
        echo -e "${BLUE}=== DATABASE LOGS ===${NC}"
        docker logs $(docker ps | grep postgres | awk '{print $1}') --tail=5
    fi
}

# Limpiar contenedores
clean_containers() {
    echo -e "${YELLOW}🧹 Limpiando contenedores parados...${NC}"
    
    docker container prune -f
    docker image prune -f
    docker network prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Deploy completo
deploy_all() {
    echo -e "${GREEN}🚀 Iniciando deployment completo...${NC}"
    
    create_network
    
    # Esperar un momento
    sleep 2
    
    deploy_backend
    
    # Esperar que el backend esté listo
    if check_backend; then
        echo -e "${YELLOW}⏳ Esperando backend (20s)...${NC}"
        sleep 20
    fi
    
    deploy_frontend
    
    # Verificar deployment
    echo -e "${YELLOW}⏳ Verificando deployment (10s)...${NC}"
    sleep 10
    
    show_status
    
    echo -e "${GREEN}🎉 Deployment completado!${NC}"
    echo -e "${GREEN}🌐 Frontend: http://$(hostname -I | awk '{print $1}')${NC}"
    echo -e "${GREEN}🔧 Backend: http://$(hostname -I | awk '{print $1}'):3000${NC}"
}

# Ejecutar acción
case $ACTION in
    "deploy")
        deploy_all
        ;;
    "frontend") 
        create_network
        deploy_frontend
        ;;
    "network")
        create_network
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_containers
        ;;
    "--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Acción no válida: $ACTION${NC}"
        show_help
        exit 1
        ;;
esac 