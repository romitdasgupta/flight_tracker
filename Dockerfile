FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY dist-server/ ./dist-server/
EXPOSE 3001
CMD ["node", "dist-server/index.js"]
