import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const psAddress = "0x89ec6Bd84E782cbA77F23D824DcCb54DC86249D4";

  // deposit eq9 in the paymentSplitter contract
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = PaymentSplitter.attach(psAddress);

  const totalShares = await paymentSplitter.totalShares();
  const value = ethers.utils.formatEther(totalShares);
  console.log("total shares:", value);

  await owner.sendTransaction({ to: psAddress, value: totalShares });

  // check total shares on payment splitter
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
