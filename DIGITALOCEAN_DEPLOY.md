# 🌊 Deployment en DigitalOcean - Sgarav Frontend App

Esta guía te llevará paso a paso para deployar tu aplicación React en un Droplet de DigitalOcean.

## 📋 Prerrequisitos

- Cuenta en DigitalOcean
- Dominio configurado (opcional pero recomendado)
- Cliente SSH configurado
- Repositorio Git con tu código

## 🚀 Paso 1: Crear Droplet en DigitalOcean

### 1.1 Configuración del Droplet

1. **Entra a DigitalOcean** y crea un nuevo Droplet
2. **Selecciona imagen**: Ubuntu 22.04 LTS
3. **Plan recomendado**: 
   - **Básico**: $6/mes (1GB RAM, 1 vCPU, 25GB SSD)
   - **Para más tráfico**: $12/mes (2GB RAM, 1 vCPU, 50GB SSD)
4. **Región**: Elige la más cercana a tus usuarios
5. **Autenticación**: SSH Key (recomendado) o Password
6. **Hostname**: `sgarav-frontend` o similar

### 1.2 Configurar DNS (si tienes dominio)

1. Ve a **Networking** > **Domains**
2. Agrega tu dominio y crea un registro A:
   ```
   Type: A
   Name: @ (o www)
   IP: [IP_DE_TU_DROPLET]
   TTL: 3600
   ```

## 🔧 Paso 2: Configuración Inicial del Servidor

### 2.1 Conectar al Droplet

```bash
# Conectar via SSH
ssh root@TU_IP_DROPLET

# O si usas usuario no-root
ssh usuario@TU_IP_DROPLET
```

### 2.2 Crear usuario (si conectaste como root)

```bash
# Crear usuario
adduser deploy
usermod -aG sudo deploy

# Configurar SSH para el nuevo usuario
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Cambiar al usuario
su - deploy
```

### 2.3 Subir código al servidor

```bash
# Opción 1: Clonar desde Git (recomendado)
git clone https://github.com/tu-usuario/sgarav-app.git
cd sgarav-app

# Opción 2: Subir archivos via SCP
# scp -r ./sgarav-app usuario@TU_IP:/home/usuario/
```

## ⚙️ Paso 3: Configuración Automática

### 3.1 Ejecutar setup automático

```bash
# Dar permisos de ejecución
chmod +x deploy-digitalocean.sh

# Ejecutar configuración inicial
./deploy-digitalocean.sh setup
```

Esto instalará automáticamente:
- ✅ Docker & Docker Compose
- ✅ Nginx
- ✅ UFW Firewall
- ✅ Dependencias del sistema
- ✅ Estructura de directorios

### 3.2 Configurar variables de entorno

```bash
# Editar archivo de configuración
nano .env

# Modificar las siguientes variables:
DOMAIN_NAME=tu-dominio.com
DO_DROPLET_IP=TU_IP_DROPLET
SSL_EMAIL=tu-email@dominio.com
```

**⚠️ Importante**: Reemplaza `tu-dominio.com` con tu dominio real.

## 🚢 Paso 4: Deploy de la Aplicación

### 4.1 Deploy inicial

```bash
# Deploy de la aplicación
./deploy-digitalocean.sh deploy
```

### 4.2 Verificar deployment

```bash
# Ver estado
./deploy-digitalocean.sh monitor

# Verificar en navegador
curl http://TU_IP_DROPLET/health
```

Tu aplicación debería estar disponible en:
- **IP**: `http://TU_IP_DROPLET`
- **Dominio**: `http://tu-dominio.com` (si configuraste DNS)

## 🔒 Paso 5: Configurar SSL (HTTPS)

### 5.1 SSL automático con Let's Encrypt

```bash
# Configurar SSL
./deploy-digitalocean.sh ssl
```

Esto:
- ✅ Instala Certbot
- ✅ Obtiene certificado SSL
- ✅ Configura renovación automática
- ✅ Redirige HTTP a HTTPS

### 5.2 Verificar SSL

```bash
# Verificar certificado
curl -I https://tu-dominio.com

# Check SSL score
# https://www.ssllabs.com/ssltest/
```

## 📊 Paso 6: Monitoreo y Mantenimiento

### 6.1 Comandos útiles

```bash
# Ver estado completo
./deploy-digitalocean.sh monitor

# Crear backup
./deploy-digitalocean.sh backup

# Actualizar aplicación
./deploy-digitalocean.sh update

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 6.2 Configurar monitoreo automático

```bash
# Agregar al crontab para backups automáticos
crontab -e

# Agregar esta línea para backup diario a las 2 AM
0 2 * * * cd /home/deploy/sgarav-app && ./deploy-digitalocean.sh backup
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error "Permission denied" con Docker

```bash
# Salir y volver a conectar para aplicar cambios de grupo
exit
ssh usuario@TU_IP_DROPLET

# O reiniciar servicio Docker
sudo systemctl restart docker
```

#### 2. Puerto 80 ocupado

```bash
# Ver qué usa el puerto
sudo netstat -tulpn | grep :80

# Si es nginx del sistema, pararlo
sudo systemctl stop nginx
sudo systemctl disable nginx
```

#### 3. Firewall bloquea tráfico

```bash
# Verificar reglas UFW
sudo ufw status

# Permitir puertos si están bloqueados
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### 4. Domain no resuelve

```bash
# Verificar DNS
nslookup tu-dominio.com

# Verificar propagación
# https://www.whatsmydns.net/
```

### Logs y Debug

```bash
# Logs de aplicación
docker-compose -f docker-compose.prod.yml logs frontend

# Logs de sistema
sudo journalctl -f

# Estado de Docker
docker system info
docker system df

# Recursos del servidor
htop
df -h
free -h
```

## 📈 Optimizaciones Avanzadas

### 1. Configurar CDN con DigitalOcean Spaces

```bash
# Crear Space en DigitalOcean
# Configurar CDN endpoint
# Subir assets estáticos al Space
```

### 2. Load Balancer (para múltiples droplets)

```bash
# En DigitalOcean panel:
# Create > Load Balancer
# Agregar droplets al pool
# Configurar health checks
```

### 3. Database separada

```bash
# Crear Managed Database en DigitalOcean
# Configurar variables de entorno
# Actualizar aplicación
```

## 💰 Estimación de Costos

### Configuración Básica
- **Droplet Basic**: $6/mes
- **Dominio**: $10-15/año
- **Total aprox**: $7-8/mes

### Configuración Escalada
- **Droplet**: $12-24/mes
- **Load Balancer**: $12/mes
- **Managed Database**: $25/mes
- **Spaces + CDN**: $5/mes
- **Total aprox**: $50-70/mes

## 🆘 Soporte y Recursos

### Documentación DigitalOcean
- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Community Tutorials](https://www.digitalocean.com/community/tutorials)
- [DigitalOcean Support](https://cloud.digitalocean.com/support)

### Comandos de Emergencia

```bash
# Restart completo de la aplicación
docker-compose -f docker-compose.prod.yml restart

# Limpiar sistema Docker
docker system prune -a

# Restaurar desde backup
tar -xzf backups/sgarav_backup_TIMESTAMP.tar.gz
./deploy-digitalocean.sh deploy

# Logs de emergencia
sudo journalctl -xeu docker
dmesg | tail -20
```

---

## ✅ Checklist Final

- [ ] Droplet creado y configurado
- [ ] DNS configurado (si aplica)
- [ ] Usuario no-root creado
- [ ] Código subido al servidor
- [ ] Setup automático ejecutado
- [ ] Variables de entorno configuradas
- [ ] Aplicación deployada exitosamente
- [ ] SSL configurado (si tienes dominio)
- [ ] Monitoring funcionando
- [ ] Backups configurados

**¡Tu aplicación está lista en producción! 🎉**

---

### 📞 ¿Necesitas ayuda?

Si encuentras problemas:

1. Revisa los logs: `./deploy-digitalocean.sh monitor`
2. Verifica conectividad: `curl http://TU_IP/health`
3. Consulta troubleshooting en esta guía
4. Revisa documentación de DigitalOcean
5. Contacta soporte si es necesario

**¡Feliz deployment! 🚀** 