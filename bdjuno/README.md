# BDJuno

BDJuno is used as a crawler to synchonize on-chain data to a database

## Requirements

- Go 1.18

## Quick Start

_Before running the following commands, modify the `GENESIS_URL` argument in the Makefile to indicate which genesis.json should be downloaded and used to be parsed by bdjuno_

```
make setup

# Edit `config.yaml` inside `.bdjuno` if necessary

docker-compose up
```

## Development

BDJuno is currently being used as a submodule in which the upstream branch `chains/likecoin/mainnet` is updated and maintained by the original author Forbole.

See [here](https://github.com/forbole/bdjuno/tree/chains/likecoin/mainnet) for more information
