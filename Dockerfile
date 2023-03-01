FROM node:18

WORKDIR /gapp

USER ${USER}

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --pure-lockfile
RUN git config --global --add safe.directory /home/arturas/dev/gapp-back
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]