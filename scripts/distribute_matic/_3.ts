import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = ethers.getDefaultProvider();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const psAddress = "0x89ec6Bd84E782cbA77F23D824DcCb54DC86249D4";

  // deposit eq9 in the paymentSplitter contract
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = PaymentSplitter.attach(psAddress);

  const totalShares = await paymentSplitter.totalShares();
  console.log("total shares:", ethers.utils.formatEther(totalShares));

  // check the balance of the contract in eq9

  // release to all addresses their amounts of share

  const payees = [];

  const data = fs.readFileSync(path.resolve(__dirname, "holders.csv"), "utf-8");
  const rows = data.split("\r\n");
  rows.shift();
  for (const row of rows) {
    payees.push(row.split(",")[0].replace(/"/g, ""));
  }

  const attemptSendTransaction = async (payee: string) => {
    try {
      console.log("attempting to send to ", payee);
      const releasable = await paymentSplitter["releasable(address)"](payee);
      if ((await provider.getCode(payee)) !== "0x") {
        console.log("it's a contract, continuing...");
        return;
      }
      console.log(releasable);
      if (releasable.eq(ethers.utils.parseEther("0"))) {
        console.log("releasable is 0 continuing");
        return;
      }
      const tx = await paymentSplitter["release(address)"](payee);
      console.log(`released to ${payee} at ${tx.hash}`);
    } catch (e) {
      console.log(e);
    }
  };

  const promises: Promise<any>[] = [];
  for (const payee of payees) {
    await attemptSendTransaction(payee);
  }

  Promise.all(promises);
  // release to all addresses their amounts of share
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
