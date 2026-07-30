FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de dependencias si ya existen
COPY package*.json ./

# Instalamos dependencias (si falla porque aún no hay package.json, no pasa nada)
RUN npm install || true

COPY . .

# Exponemos el puerto por defecto de Vite
EXPOSE 5173