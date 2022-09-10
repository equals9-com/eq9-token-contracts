import { ethers } from "hardhat";
import usersAndWallets from "./users_and_wallets";

const { BigNumber } = ethers;

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const eq9Address = String(process.env.POLYGON_EQ9_ADDRESS);
  console.log(eq9Address);

  const EQ9 = await ethers.getContractFactory("EQ9");

  const eq9 = EQ9.attach(eq9Address);

  const eq9Balance = (await eq9.balanceOf(owner.address)).toString();
  console.log("eq9 balance", eq9Balance);

  // first, parse all wallets from the list of wallets

  // calculate the entire amount of eq9 necessary to send

  let totalAmount = BigNumber.from("0");
  const payees = [];
  const shares = [];

  for (const user of usersAndWallets) {
    const balance = BigNumber.from(user.wallet.balance);
    totalAmount = totalAmount.add(balance);
    if (BigNumber.from("0").eq(BigNumber.from(user.wallet.balance))) continue;
    payees.push(user.wallet.address);
    shares.push(user.wallet.balance);
  }

  // console.table("addresses and shares", payees);
  // console.table(shares);
  // then create a payment splitter and pass these values
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy(payees, shares);
  await paymentSplitter.deployed();

  const totalShares = await paymentSplitter.totalShares();

  console.log("total shares: ", totalShares);

  console.log("payment splitter deployed to: ", paymentSplitter.address);

  console.log(
    "total eq9 in equalssport: ",
    ethers.utils.formatEther(totalAmount)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
