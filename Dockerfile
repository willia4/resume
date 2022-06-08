FROM node:18 as builder

COPY *.ts /app/
COPY *.json /app/
COPY src/ /app/src

WORKDIR /app
RUN npm install -g gulp && npm install
RUN gulp build

FROM nginx
LABEL me.jameswilliams.author="james@jameswilliams.me"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY assets /usr/share/nginx/html