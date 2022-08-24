import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current balance", balance.toString());

  const eq9Address = "0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B";
  const stakingAddress = "0x11B8AbF80246E103786f7390bAf1688CAC5b466b";

  const Staking = await ethers.getContractFactory("Staking");
  const EQ9 = await ethers.getContractFactory("EQ9");

  const staking = Staking.attach(stakingAddress);
  const eq9 = EQ9.attach(eq9Address);

  const eq9Balance = (await eq9.balanceOf(owner.address)).toString();
  console.log("eq9 balance", eq9Balance);

  //   await eq9.approve(staking.address, ethers.utils.parseEther("10000"));
  await staking.stake(
    ethers.utils.parseEther("10"),
    "0xc92ca1ef967CA392e5F784BF72ffd468a264EcdB"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
