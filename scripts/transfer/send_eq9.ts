import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const eq9Adress = "0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6";

  const EQ9 = await ethers.getContractFactory("EQ9");

  const eq9 = EQ9.attach(eq9Adress);

  const res = await eq9.transfer(
    "0x29c32A5F1CFEF814AB1A3AC552B738D4D4b470d4",
    ethers.utils.parseEther("6000")
  );

  console.log(res.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
