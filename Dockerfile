FROM node:22

WORKDIR /app

COPY tsconfig.json ./
COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD [ "npm", "run", "preview" ]
