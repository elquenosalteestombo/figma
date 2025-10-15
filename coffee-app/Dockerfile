## Dockerfile para coffee-app
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock (si existe) e instalar deps de producción
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copiar el resto de la app
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "server.js"]
