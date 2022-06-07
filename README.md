# LikeDAO

## Prerequisite

- asdf https://asdf-vm.com/#/core-manage-asdf?id=install
- Docker Compose https://docs.docker.com/compose/install/

## Requirements

- Golang 1.18
- Node 16
- Yarn 1.22.17

Managed by [asdf](https://github.com/asdf-vm/asdf)

## Quick Start

```
make setup
docker-compose up

# In another tab

make -C react-app dev
```

Then visit http://localhost:3000

## Development

### React App

Please visit [here](./react-app/README.md#development) for more information

### GraphQL Server

Please visit [here](./graphql-server/README.md#development) for more information

### BDJuno

Please visit [here](./bdjuno/README.md#development) for more information

## Deployment

To execute a deployment for the LikeDAO system, please review the files in the [deployment folder](./deploy/) and follow the instructions below.

## Prerequisite

- Set of deployment values
- Set of deployment config assets
- Permission to access/upload image to registry

## Requirements

- [Helm v3.6.3](https://helm.sh/docs/intro/install/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)

## Procedure

### Building and deploying new docker images

1. Run `make docker-build`
2. Run `make docker-push`

### Deployment

1. Run `make -C deploy make-deployment-assets` to create a set of deployment configuration files
2. Review each file in the [asset](./deploy/likedao/static/) folder and update if necessary
3. Duplicate the content in [values template](./deploy/likedao/values.sample.yaml) and create one that fits the deployment environment
4. Run `make -C deploy deploy NAMESPACE=${NAMESPACE} VALUES=${PATH_TO_VALUES}`
