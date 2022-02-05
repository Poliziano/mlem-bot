FROM node:16-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install
CMD [ "node", "src/index.js" ]