FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3335:3335

EXPOSE 3334:3334

CMD [ "node", "src/auth.js" ]