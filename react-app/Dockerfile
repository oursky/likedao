FROM node:16.15.0 as builder

WORKDIR /usr/src/app
COPY ./react-app/package.json ./react-app/yarn.lock ./
RUN yarn

WORKDIR /usr/src/graphql-schema
COPY ./graphql-schema ./

WORKDIR /usr/src/app
COPY ./react-app .

RUN make codegen
RUN make build

FROM nginx:1.21.6-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./react-app/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
