import dotenv from 'dotenv';
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: parseInt(`${process.env.CHAIN_ID_LOCAL}`),
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      }
    },
    sepolia: {
      url: process.env.INFURA_URL,
      chainId: parseInt(`${process.env.CHAIN_ID_SEPOLIA}`),
      accounts: {
        mnemonic: process.env.SECRET,
      }
    },
    bsctest: {
      url: process.env.BSC_URL,
      chainId: parseInt(`${process.env.CHAIN_ID_BINANCE_SMART_CHAIN}`),
      accounts: {
        mnemonic: process.env.SECRET,
      }
    }   
  },
  etherscan: {
    apiKey: process.env.API_KEY_BSCSCAN
  }  
};

export default config;