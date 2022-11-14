import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());
  const data = fs.readFileSync(path.resolve(__dirname, "holders.csv"), "utf-8");
  const rows = data.split("\r\n");
  rows.shift();
  const addresses: string[] = [];
  for (const row of rows) {
    addresses.push(row.split(",")[0].replace(/"/g, ""));
  }

  const amounts = [];
  for (const address of addresses) {
    amounts.push(ethers.utils.parseEther("0.02"));
  }
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy(
    addresses.map((adr) => ethers.utils.getAddress(adr)),
    amounts
  );

  await paymentSplitter.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
