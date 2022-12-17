import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const eq9Adress = "0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B";

  const EQ9 = await ethers.getContractFactory("EQ9");

  const eq9 = EQ9.attach(eq9Adress);

  const res = await eq9.transfer(
    "0x9BDf5462dB8eC1551588862B6E1662B174Aa66B6",
    ethers.utils.parseEther("1000000")
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
