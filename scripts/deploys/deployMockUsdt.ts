import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current balance", balance.toString());

  const Token = await ethers.getContractFactory("MockUSDT");
  const erc20 = await Token.deploy();

  await erc20.deployed();
  console.log("mock usdt deployed to deployed to:", erc20.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
