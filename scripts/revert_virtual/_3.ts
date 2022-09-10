import { ethers } from "hardhat";
import usersAndWallets from "./users_and_wallets";

const { BigNumber } = ethers;

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const eq9Address = String(process.env.MUMBAI_EQ9_ADDRESS);
  const psAddress = "0x7862176f6833d14c5659fa41106b8c40E0093C43";

  // deposit eq9 in the paymentSplitter contract
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = PaymentSplitter.attach(psAddress);

  const EQ9 = await ethers.getContractFactory("EQ9");
  const eq9 = EQ9.attach(eq9Address);

  const totalShares = await paymentSplitter.totalShares();
  console.log("total shares:", ethers.utils.formatEther(totalShares));

  // check the balance of the contract in eq9
  const eq9Balance = await eq9.balanceOf(psAddress);
  console.log("eq9 balance of contract", ethers.utils.formatEther(eq9Balance));

  if ((await eq9.balanceOf(psAddress)).eq("0")) {
    console.log("all shares released");
    return;
  }
  // release to all addresses their amounts of share

  const payees = [];
  const shares = [];

  for (const user of usersAndWallets) {
    if (BigNumber.from("0").eq(BigNumber.from(user.wallet.balance))) continue;
    payees.push(user.wallet.address);
    shares.push(user.wallet.balance);
  }

  for (const payee of payees) {
    const tx = await paymentSplitter["release(address,address)"](
      eq9.address,
      payee
    );
    console.log(`released to ${payee} at ${tx.hash}`);
  }

  // release to all addresses their amounts of share
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
