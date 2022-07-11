# LikeDAO GraphQL Server

This GraphQL server is used to aggregate chain data as well as miscellaneous data to be used on the LikeDAO SPA

## Requirements

- Go 1.18

## Quick Start

```
make vendor
make codegen
docker-compose up
```

## Development

## GraphQL Playground

By default docker will start the server with GIN_MODE=debug, visit http://localhost:8080/graphql

## Update GraphQL Schema

1. Apply changes to [existing schemas](../graphql-schema/)
2. Update the codegen configuration if needed
   - References:
     - https://gqlgen.com/config/
     - https://gqlgen.com/reference/resolvers/
3. Run `make codegen`
4. Implement resolver in the [resolvers](./pkg/resolvers/) folder
5. Write tests if needed

## Data Paths

```
Gin -> GraphQL Handler -> Resolver -> Data Loader -> Query -> DB
Gin -> GraphQL Handler -> Resolver -> Mutator -> DB
```

## Migrations

### Create migration

```
make migration-new NAME=migration-name
```

### Up

```
make migration-up
```

### Down

```
make migration-down
```

### Status

```
make migration-status
```
