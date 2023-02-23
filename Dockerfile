FROM node:18-alpine

WORKDIR /gapp

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn install --pure-lockfile

COPY . .

ENV BUILD_SCRIPT=$BUILD_SCRIPT
ENV WEBHOOK_SERVER_URL=$WEBHOOK_SERVER_URL
ENV WEBHOOK_SERVER_ACCESS_TOKEN=$WEBHOOK_SERVER_ACCESS_TOKEN
ENV WEBHOOK_SERVER_EVENT=$WEBHOOK_SERVER_EVENT

EXPOSE 3000

CMD ["yarn", "start"]