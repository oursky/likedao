# LikeDAO

LikeDAO is a web app to facilitate participation and discussion in LikeCoin Chain's governance.

Built using React, GraphQL, Golang and PostgreSQL. Deployed with Kubernetes and Helm.

## Architecture

![Architecture Diagram](./docs/ArchDiagram.png)

See [Architecture Docs](./docs/Architecture.md) for more details.

## Development

### Quick Start

```
# Target genesis url for bdjuno to parse from
export GENESIS_URL=https://raw.githubusercontent.com/likecoin/mainnet/master/genesis.json

make setup
docker-compose up

# In another tab

make -C react-app dev

Note that it will take BDJuno some time to get data populated to the database
```

Then visit http://localhost:3000

### Prerequisite

- asdf <https://asdf-vm.com/#/core-manage-asdf?id=install>
- Docker Compose <https://docs.docker.com/compose/install/>

### Requirements

- Golang 1.18
- Node 16
- Yarn 1.22.17

Managed by [asdf](https://github.com/asdf-vm/asdf)

## Customization

The LikeDAO is a generic DAO platform that does not only work with the LikeCoin chain but also other Cosmos-based chain, the following states the customizable configurations that can be modified to make the app work with one's favourite chain.

See [Customization Docs](./docs/Customization.md)

### React App

Please visit [here](./react-app/README.md#development) for more information

### GraphQL Server

Please visit [here](./graphql-server/README.md#development) for more information

### BDJuno

Please visit [here](./bdjuno/README.md#development) for more information

## Deployment

Pick what version you would like to deploy, or build the images yourself as follow.

1. Run `make docker-build`
2. Run `make docker-push`

After ensure the images are in place, follow the instruction in [deploy folder](./deploy/README.md).

## Contributing

See [Contributing Docs](./docs/Contributing.md)
