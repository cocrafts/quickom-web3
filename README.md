# Public part of quikom web3 infrastructure

### Pre-requisites
- Install Node.js, suggested `version@20.11.1`
- Yarn `v4`, [installation instruction here](https://yarnpkg.com/getting-started/install)
- Install `metacraft` CLI via `npm i -g metacraft-cli`, suggested `version@0.0.87+`

### Development
- Run `yarn dev` or `metacraft` to launch development server

### Deployment
- Run `yarn deploy --stage [development | production | staging]` to deploy under AWS, as a Serverless stack

### Conventions
- Enable EsLint on your Code Editor/IDE, enable format-on-save to keep your code always in the right format
