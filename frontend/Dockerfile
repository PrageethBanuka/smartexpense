# Build and run CRA app
FROM node:26-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy app
COPY . .

# CRA runs dev server on 3000
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
