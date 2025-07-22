FROM node:20-slim

WORKDIR /app

COPY cso-frontend/package*.json ./
RUN npm install

COPY cso-frontend ./src

WORKDIR /app/src

EXPOSE 3000
CMD ["npm", "start"]
