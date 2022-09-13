FROM golang:1.18.6-bullseye as builder

WORKDIR /usr/src/app
COPY ./graphql-server/go.mod ./graphql-server/go.sum ./graphql-server/Makefile ./
RUN make vendor

WORKDIR /usr/src/graphql-schema
COPY ./graphql-schema .

WORKDIR /usr/src/app
COPY ./graphql-server .

RUN make codegen
RUN make build

FROM debian:bullseye-slim

RUN mkdir -p /usr/likedao/bin
WORKDIR /usr/likedao/bin

COPY --from=builder \
	/usr/src/app/bin \
	/usr/likedao/bin

COPY --from=builder \
	/usr/src/app/migrations \
	/usr/src/app/migrations

CMD ["/usr/likedao/bin/graphql-server"]