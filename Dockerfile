FROM node:16

WORKDIR /app

COPY package*.json ./
COPY ./prisma prisma
COPY ./src src

RUN npm install

COPY . .

EXPOSE 3500

CMD ["npm", "run", "start:prod"]