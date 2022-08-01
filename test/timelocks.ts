import { ethers } from "hardhat";
import { Equals9UtilityAndStaking } from "../types";

const getUnixTime = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

describe("timelocks", function () {
  let eq9: Equals9UtilityAndStaking;

  it("Should deploy the eq9 token", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const Equals9UtilityAndStaking = await ethers.getContractFactory(
      "Equals9UtilityAndStaking"
    );
    eq9 = await Equals9UtilityAndStaking.deploy();
    const totalToken = await eq9.balanceOf(owner.address);
    console.log(totalToken.toString());
    await eq9.deployed();
  });

  it("should deploy the timelock with the eq9 token for the seed sales", async () => {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const TokenTimeLock = await ethers.getContractFactory("TokenTimelock");

    // notice that date is of pattern mm-dd-yyyy
    // seed sales time
    const dates = [
      new Date("10/01/2023"),
      new Date("11/01/2023"),
      new Date("12/01/2023"),
      new Date("01/01/2024"),
      new Date("02/01/2024"),
      new Date("03/01/2024"),
      new Date("04/01/2024"),
      new Date("05/01/2024"),
      new Date("06/01/2024"),
      new Date("07/01/2024"),
      new Date("08/01/2024"),
      new Date("09/01/2024"),
      new Date("10/01/2024"),
      new Date("11/01/2024"),
      new Date("12/01/2024"),
      new Date("01/01/2025"),
      new Date("02/01/2025"),
      new Date("03/01/2025"),
      new Date("04/01/2025"),
      new Date("05/01/2025"),
      new Date("06/01/2025"),
      new Date("07/01/2025"),
      new Date("08/01/2025"),
      new Date("09/01/2025"),
      new Date("10/01/2025"),
      new Date("11/01/2025"),
      new Date("01/12/2025"),
    ];
    const timestamps = dates.map((i) => getUnixTime(i));
    console.log(timestamps);
    const timelock = await TokenTimeLock.deploy(
      eq9.address,
      owner.address,
      timestamps
    );
  });
});
