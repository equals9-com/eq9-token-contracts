import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const eq9Address = String(process.env.POLYGON_EQ9_ADDRESS);
  const psAddress = "0x18E8175BcDf238FAB20A1A1e319F6A98Ba687fE5";

  // deposit eq9 in the paymentSplitter contract
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = PaymentSplitter.attach(psAddress);

  const EQ9 = await ethers.getContractFactory("EQ9");
  const eq9 = EQ9.attach(eq9Address);

  const totalShares = await paymentSplitter.totalShares();
  console.log("total shares:", ethers.utils.formatEther(totalShares));

  const tx = await eq9.transfer(psAddress, totalShares);
  await tx.wait(1);
  // check total shares on payment splitter
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
