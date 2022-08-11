import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const { PRIVATE_KEY, SCAN_KEY, MUMBAI_RPC_URL, POLYGON_RPC_URL } = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

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
