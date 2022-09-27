import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current balance", balance.toString());

  const eq9Address = "0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6";

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(eq9Address);

  await staking.deployed();
  console.log("staking deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
