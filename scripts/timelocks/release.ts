import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const timelockAddress = "0xC9B1D9335BE15625Ddf91EBb848cEeEDc546B02E";

  const Timelock = await ethers.getContractFactory("TokenMultiTimelock");
  const instance = Timelock.attach(timelockAddress);

  const tx = await instance.release();

  console.log(tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
