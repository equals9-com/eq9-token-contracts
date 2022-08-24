import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current balance", balance.toString());

  const eq9Address = "0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B";

  const Token = await ethers.getContractFactory("Staking");
  const erc20 = await Token.deploy(eq9Address);

  await erc20.deployed();
  console.log("staking deployed to:", erc20.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
