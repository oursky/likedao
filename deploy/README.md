# Deployment

To execute a deployment for the LikeDAO system, please review the files in this folder and follow the instructions below.

### Prerequisite

- Set of deployment values
- Set of deployment config assets
- Permission to access/upload image to registry

### Requirements

- [Helm v3.6.3](https://helm.sh/docs/intro/install/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)

### Procedure

Decide which version you would like to deploy, specific via `buildTag` or checkout specific version and build the docker images yourself.

1. Run `make -C deploy make-deployment-assets` to create a set of deployment configuration files
2. Review each file in the [asset](./deploy/likedao/static/) folder and update if necessary
3. Duplicate the content in [values template](./deploy/likedao/values.sample.yaml) and create one that fits the deployment environment
4. Run `make -C deploy deploy NAMESPACE=${NAMESPACE} VALUES=${PATH_TO_VALUES}`
