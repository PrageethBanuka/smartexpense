# Use Node LTS (22.x) — kept up-to-date for security patches
FROM node:22-alpine
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/index.js"]
