import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const { PRIVATE_KEY, SCAN_KEY, MUMBAI_RPC_URL, POLYGON_RPC_URL } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.6",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.5.17",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  networks: {
    polygon: {
      url: String(POLYGON_RPC_URL),
      accounts: [String(PRIVATE_KEY)],
    },
    mumbai: {
      url: String(MUMBAI_RPC_URL),
      accounts: [String(PRIVATE_KEY)],
    },
  },
  etherscan: {
    apiKey: String(SCAN_KEY),
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
    alwaysGenerateOverloads: true, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
  },
};

export default config;
