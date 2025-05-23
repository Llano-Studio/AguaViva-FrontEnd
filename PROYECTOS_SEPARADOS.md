# 🏗️ Deployment de Proyectos Separados - Frontend + Backend

Guía para deployar tu aplicación con **proyectos separados** en DigitalOcean.

## 📁 Estructura de Carpetas en el Servidor

```
/home/deploy/
├── sgarav-frontend/          # Este proyecto (React)
│   ├── Dockerfile
│   ├── docker-compose.prod.yml
│   ├── nginx.conf
│   └── src/
├── sgarav-backend/           # Tu proyecto NestJS
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── src/
│   └── ...
└── sgarav-shared/            # Servicios compartidos
    ├── docker-compose.shared.yml
    ├── nginx-proxy.conf
    └── deploy-all.sh
```

## 💻 Droplet Recomendado para Full-Stack

### **$18/mes - 2GB RAM, 2 vCPUs, 50GB SSD**

**Distribución de recursos:**
- Frontend React: ~200MB RAM, 0.5 CPU
- Backend NestJS: ~400MB RAM, 1 CPU  
- PostgreSQL: ~800MB RAM, 1 CPU
- Redis: ~100MB RAM, 0.25 CPU
- Sistema: ~500MB RAM, 0.25 CPU

## 🚀 Paso 1: Configuración de Red Compartida

### 1.1 Crear red Docker compartida

```bash
# Crear red para comunicación entre proyectos
docker network create sgarav-network --subnet=172.30.0.0/16
```

### 1.2 Servicios compartidos (Base de datos)

Crea `sgarav-shared/docker-compose.shared.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sgarav-postgres
    restart: unless-stopped
    networks:
      - sgarav-network
    environment:
      - POSTGRES_DB=sgarav_db
      - POSTGRES_USER=sgarav_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sgarav_user"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: sgarav-redis
    restart: unless-stopped
    networks:
      - sgarav-network
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

networks:
  sgarav-network:
    name: sgarav-network
    external: true

volumes:
  postgres_data:
  redis_data:
```

## 🔧 Paso 2: Modificar Docker Compose del Frontend

En tu `docker-compose.prod.yml`, agrega la red externa:

```yaml
version: '3.8'

services:
  frontend:
    # ... tu configuración actual ...
    networks:
      - app-network
      - sgarav-network  # Agregar esta línea
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://sgarav-backend:3000  # Comunicación interna
      # ... otras variables ...

networks:
  app-network:
    driver: bridge
  sgarav-network:
    name: sgarav-network
    external: true  # Red externa creada previamente
```

## ⚙️ Paso 3: Modificar Docker Compose del Backend

En tu backend `docker-compose.yml`, conecta a la red compartida:

```yaml
version: '3.8'

services:
  backend:
    # ... tu configuración actual ...
    container_name: sgarav-backend  # Nombre fijo para comunicación
    networks:
      - backend-network
      - sgarav-network  # Agregar esta línea
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=sgarav-postgres  # Apuntar al contenedor compartido
      - DATABASE_PORT=5432
      - REDIS_HOST=sgarav-redis        # Apuntar al Redis compartido
      # ... otras variables ...

networks:
  backend-network:
    driver: bridge
  sgarav-network:
    name: sgarav-network
    external: true  # Red externa creada previamente
```

## 🌐 Paso 4: Reverse Proxy (Opcional)

Crea `sgarav-shared/nginx-proxy.conf`:

```nginx
upstream frontend {
    server sgarav-frontend:80;
}

upstream backend {
    server sgarav-backend:3000;
}

server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend - Páginas principales
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health checks
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 📝 Paso 5: Script de Deployment

Crea `sgarav-shared/deploy-all.sh`:

```bash
#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando deployment full-stack...${NC}"

# 1. Crear red si no existe
echo -e "${YELLOW}🔗 Configurando red compartida...${NC}"
docker network create sgarav-network --subnet=172.30.0.0/16 2>/dev/null || echo "Red ya existe"

# 2. Levantar servicios compartidos
echo -e "${YELLOW}🗄️ Iniciando servicios compartidos (DB, Redis)...${NC}"
cd /home/deploy/sgarav-shared
docker-compose -f docker-compose.shared.yml up -d

# 3. Esperar que la DB esté lista
echo -e "${YELLOW}⏳ Esperando base de datos...${NC}"
sleep 30

# 4. Deploy backend
echo -e "${YELLOW}⚙️ Desplegando backend...${NC}"
cd /home/deploy/sgarav-backend
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# 5. Esperar backend
echo -e "${YELLOW}⏳ Esperando backend...${NC}"
sleep 20

# 6. Deploy frontend
echo -e "${YELLOW}🎨 Desplegando frontend...${NC}"
cd /home/deploy/sgarav-frontend
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 7. Verificar estado
echo -e "${YELLOW}📊 Verificando deployment...${NC}"
sleep 10

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo -e "${GREEN}🌐 Frontend: http://tu-ip${NC}"
echo -e "${GREEN}🔧 Backend: http://tu-ip:3000${NC}"
echo -e "${GREEN}🗄️ Database: tu-ip:5432${NC}"

# Mostrar logs
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 🔄 Comandos de Uso Diario

```bash
# Deploy completo
chmod +x /home/deploy/sgarav-shared/deploy-all.sh
./deploy-all.sh

# Solo frontend
cd /home/deploy/sgarav-frontend
docker-compose -f docker-compose.prod.yml up -d --build

# Solo backend
cd /home/deploy/sgarav-backend
docker-compose up -d --build

# Ver logs de toda la aplicación
docker logs sgarav-frontend -f
docker logs sgarav-backend -f
docker logs sgarav-postgres -f

# Parar todo
docker stop sgarav-frontend sgarav-backend sgarav-postgres sgarav-redis

# Restart completo
cd /home/deploy/sgarav-shared && ./deploy-all.sh
```

## 📊 Variables de Entorno

Crea `.env` en cada proyecto:

### Frontend `.env`:
```env
NODE_ENV=production
REACT_APP_API_URL=http://tu-dominio.com/api
```

### Backend `.env`:
```env
NODE_ENV=production
DATABASE_HOST=sgarav-postgres
DATABASE_PORT=5432
DATABASE_NAME=sgarav_db
DATABASE_USER=sgarav_user
DATABASE_PASSWORD=tu_password_seguro
REDIS_HOST=sgarav-redis
REDIS_PORT=6379
JWT_SECRET=tu_jwt_secret_muy_seguro
```

### Compartido `.env`:
```env
DB_PASSWORD=tu_password_seguro_para_db
REDIS_PASSWORD=tu_password_redis
```

## 🛡️ Beneficios de esta Arquitectura

✅ **Independencia**: Cada proyecto mantiene su autonomía
✅ **Comunicación**: Red compartida permite comunicación interna
✅ **Escalabilidad**: Puedes escalar cada servicio por separado
✅ **Mantenimiento**: Actualizaciones independientes
✅ **Debugging**: Logs y debugging por separado
✅ **Flexibilidad**: Fácil modificar configuraciones individuales

## 🚀 Deployment en DigitalOcean

1. **Crear Droplet $18/mes** (2GB RAM, 2 vCPUs)
2. **Clonar ambos proyectos** en `/home/deploy/`
3. **Configurar variables** `.env` en cada proyecto
4. **Ejecutar script** `./deploy-all.sh`
5. **Configurar SSL** con Let's Encrypt
6. **Configurar dominio** apuntando a la IP del droplet

**¡Tu aplicación full-stack estará lista en producción! 🎉** 