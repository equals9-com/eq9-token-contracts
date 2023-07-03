import { ethers } from "hardhat";
import { PolygonGasCalculatorService } from "../utils/gasCalculator";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const calculator = new PolygonGasCalculatorService();
  const { maxFeePerGas, maxPriorityFeePerGas } = await calculator.calcGas();

  const eq9Adress = "0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6";

  const EQ9 = await ethers.getContractFactory("EQ9");

  const eq9 = EQ9.attach(eq9Adress);

  const res = await eq9.transfer(
    "0xb6C4F3084aa922De4c3DAc03b1FF3C6d2aaf34Cd",
    ethers.utils.parseEther("0.1"),
    { maxFeePerGas, maxPriorityFeePerGas }
  );

  console.log(res.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
