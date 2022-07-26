# Customization

List of customizable files

- /graphql-server/.env
- /react-app/config/config.debug.js
- /react-app/config/keplr.debug.js
- /bdjuno/.bdjuno/config.yaml

## GraphQL Server

The LikeDAO backend uses a dotenv file that contains server configurations in the form of environemtn variables. This file is for **development use** only where a `.env` file will be created from the `.env.example` file upon running `make setup` in the server's root folder.

Note that the file contains configurations specific to the Cosmos-based blockchains so it should be configured to match the selected chain for the server to function correctly.

## React App

The LikeDAO frontend has two files that contain configurations specific to a Cosmos-based blockchain.

After running `make setup`, two extra files with the suffix `debug.js` will appear in the `./config` folder.

`config.debug.js` contains common configurations that are used among components and providers in the app.
`keplr.debug.js` contains neccessary information for a chain that will be used by the Keplr wallet extension via their [Suggest Chain API](https://docs.keplr.app/api/suggest-chain.html)

These files are specificly for **development use** and will be copied to the `./public` folder when `make dev` is executed so make sure the files are well-prepared before any development process is started.

## BDJuno

BDJuno reads its configuration from a file named `config.yaml` under its home folder, which is set to `./.bdjuno` for LikeDAO by default. A sample file `config.example.yaml` will be copied to the home folder when `make setup` is executed. Note that this file is for **development use** only and should be configued corresponding to the `genesis.json` file downloaded during the setup. A misalignment between the config file and the genesis file could lead to data corruption in the database and will need to be wiped and recrawled.
