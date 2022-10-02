import { ethers } from "hardhat";
import wallets from "./wallets";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current address", owner.address);
  console.log("current balance", balance.toString());

  const eq9Address = "0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B";
  const stakingAddress = "0x437070cAf868604bE93613627f99a655586EE7C9";

  const Staking = await ethers.getContractFactory("Staking");
  const EQ9 = await ethers.getContractFactory("EQ9");

  const staking = Staking.attach(stakingAddress);
  const eq9 = EQ9.attach(eq9Address);

  const eq9Balance = (await eq9.balanceOf(owner.address)).toString();
  console.log("eq9 balance", eq9Balance);

  // await eq9.approve(staking.address, ethers.utils.parseEther("50000"));

  for (const wallet of wallets) {
    try {
      const tx = await staking.stake(
        ethers.utils.parseEther("1"),
        wallet.address
      );

      await tx.wait();
      console.log("sent transaction");
    } catch (e) {
      console.log(e);
      console.log("continuing...");
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
