# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject API URL at build time (Vite requires VITE_* prefix)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Serve stage ---
FROM nginx:alpine

# SPA routing support (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite outputs to /dist
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
