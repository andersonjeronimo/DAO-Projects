# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
# Condominum Smart Contract
Blockchain smart contract for DAO Condominium

## How to test
1. git clone
2. cd condominium-contract
3. npm install
4. npx hardhat compile
5. npx hardhat test

## How to deploy
1. copy .env.example as .env
2. fill .env variables
3. check hardhat.config.ts 
4. npx hardhat run scripts/deploy.ts --network <network name>
5. npx hardhat verify --network <network name> <contract address>