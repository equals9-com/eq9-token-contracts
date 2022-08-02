import { ethers } from "hardhat";
import { Equals9UtilityAndStaking, TokenMultiTimelock } from "../types";
import { expect } from "chai";
import { seedSalesDates } from "../config/releaseDates";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

describe("timelocks", function () {
  let eq9: Equals9UtilityAndStaking;
  let timelock: TokenMultiTimelock;

  it("Should deploy the eq9 token", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const Equals9UtilityAndStaking = await ethers.getContractFactory(
      "Equals9UtilityAndStaking"
    );
    eq9 = await Equals9UtilityAndStaking.deploy();
    await eq9.deployed();

    const ownerBalance = await eq9.balanceOf(owner.address);
    expect((await ownerBalance).toString()).to.be.equal(
      ethers.utils.parseUnits("1800000000", "ether")
    );
  });

  it("should deploy the timelock with the eq9 token for the seed sales", async () => {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    // notice that date is of pattern mm-dd-yyyy
    // seed sales time

    const releaseTimesUnix = seedSalesDates.map((i) => getUnixTime(i));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits("10178660", "ether")
    );

    console.log(releaseAmounts);
    timelock = await TokenTimeLock.deploy(
      eq9.address,
      owner.address,
      releaseTimesUnix,
      releaseAmounts,
      "seed sales"
    );

    await timelock.deployed();

    await eq9
      .connect(owner)
      .transfer(
        timelock.address,
        ethers.utils.parseUnits("274823820", "ether")
      );
  });

  it("should deploy the harvesting timelock with the eq9 token for the harvest", async () => {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    // notice that date is of pattern mm-dd-yyyy
    // seed sales time

    const releaseTimesUnix = seedSalesDates.map((i) => getUnixTime(i));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits("10178660", "ether")
    );

    console.log(releaseAmounts);
    timelock = await TokenTimeLock.deploy(
      eq9.address,
      owner.address,
      releaseTimesUnix,
      releaseAmounts,
      "harvest"
    );

    await timelock.deployed();

    await eq9
      .connect(owner)
      .transfer(
        timelock.address,
        ethers.utils.parseUnits("274823820", "ether")
      );
  });

  it("should not allow to release before the scheduled date", async () => {
    await expect(timelock.release()).to.be.revertedWith(
      "current time is before release"
    );
  });

  it("should release tokens at each date", async () => {
    // time calculated in seconds. 60 seconds times 60 times 24 to get seconds in a day, times 31
    // to get a month + 1 just to be sure that it's past the release

    for (let i = 0; i < seedSalesDates.length; i++) {
      await ethers.provider.send("evm_mine", [getUnixTime(seedSalesDates[i])]);

      const releaseAmount = await timelock.releaseAmounts(i);
      console.log(releaseAmount.toString());
      const tx = await timelock.release();
      const receipt: any = await tx.wait();
      const releaseIndex = ethers.BigNumber.from(
        receipt.events[1].args.releaseIndex
      ).toString();

      console.log(releaseIndex);
    }
  });

  it("timelock contract eq9 token balance should be 0", async () => {
    // time calculated in seconds. 60 seconds times 60 times 24 to get seconds in a day, times 31
    // to get a month + 1 just to be sure that it's past the release

    const timelockBalance = await eq9.balanceOf(timelock.address);
    expect(timelockBalance.toString()).to.be.equal(
      ethers.utils.parseUnits("0", "ether")
    );
  });

  it("should not allow to release before the scheduled date", async () => {
    await expect(timelock.release()).to.be.revertedWith("no more schedules");
  });
});
