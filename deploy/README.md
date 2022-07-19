# Deployment

To execute a deployment for the LikeDAO system, please review the files in this folder and follow the instructions below.

### Prerequisite

- Set of deployment values
- Set of deployment config assets
- Permission to access/upload image to registry
- Connection details to database

### Requirements

- [Helm v3.6.3](https://helm.sh/docs/intro/install/)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)
- [PostgreSQL 12+](https://www.postgresql.org/)

### Procedure

## Setting up databases

For the likedao system to work we will have to setup the databases correctly, follow the instructions below to setup the server and bdjuno db

### BDJuno DB

1. Go to the main likedao repo and make sure the submodules are initialized
2. In `bdjuno/bdjuno/database/schema`, there are multiple sql files. Run following to create a single sql.

```
ls | sed -l 's/^/\\i /;w all.sql'
cat <(echo 'CREATE SCHEMA IF NOT EXISTS "bdjuno";set search_path = "bdjuno";') all.sql > create.sql
```

3. Run the `create.sql` using command like: `psql --host 127.0.0.1 -U likedao-bdjuno -d likedao-bdjuno -f create.sql`

### Server DB

1. Login to the database
2. Run the following sql to create a schema, this is because `golang bun` sets the default schema on connect

```
CREATE SCHEMA IF NOT EXISTS "likedao";
```

3. The db should be automatically migrated when the server is deployed

## Deployment

Decide which version you would like to deploy, specific via `buildTag` or checkout specific version and build the docker images yourself.

1. Duplicate the content in [values template](./deploy/likedao/values.sample.yaml) and create one that fits the deployment environment
2. Run `make -C deploy deploy NAMESPACE=${NAMESPACE} VALUES=${PATH_TO_VALUES}`
