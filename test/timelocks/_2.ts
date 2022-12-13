import { ethers } from "hardhat";
import { EQ9, TokenMultiTimelock } from "../../types";
import { expect } from "chai";
import {
  beneficiary,
  contractName,
  dates,
  monthlyRelease,
  totalLocked,
} from "../../config/personalTimeLocks";

import { mine } from "@nomicfoundation/hardhat-network-helpers";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

describe("timelocks", function () {
  let eq9: EQ9;
  let timelock: TokenMultiTimelock;

  it("Should deploy the eq9 token", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const EQ9 = await ethers.getContractFactory("EQ9");
    eq9 = await EQ9.deploy();
    await eq9.deployed();

    const ownerBalance = await eq9.balanceOf(owner.address);
    expect((await ownerBalance).toString()).to.be.equal(
      ethers.utils.parseUnits("1800000000", "ether")
    );
  });

  it("Should deploy timelock", async function () {
    const [owner] = await ethers.getSigners();

    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    const releaseTimesUnix = (dates as Date[]).map((date) => getUnixTime(date));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits(String(monthlyRelease), "ether")
    );

    timelock = await TokenTimeLock.deploy(
      eq9.address,
      String(beneficiary),
      releaseTimesUnix,
      releaseAmounts,
      String(contractName)
    );

    await eq9
      .connect(owner)
      .transfer(
        timelock.address,
        ethers.utils.parseUnits(String(totalLocked), "ether")
      );
  });

  it("should have the proper non locked value in contract after lock", async () => {
    const contractSupply = eq9.balanceOf(timelock.address);

    // TODO; requires validation with financial
    expect((await contractSupply).toString()).to.be.equal(
      ethers.utils.parseUnits("24000000", "ether")
    );
  });

  it("should release tokens at each date", async () => {
    // mine a date that is past all schedules
    await mine(getUnixTime(new Date("12/09/2023")));

    for (let i = 0; i < dates.length; i++) {
      const tx = await timelock.release();
      const receipt: any = await tx.wait();
      ethers.BigNumber.from(receipt.events[1].args.releaseIndex).toString();
    }

    //   // each of the timelock has it's own schedule. The order of the
    //   // timelock array represent the same order of the configs.
    //   // so, the amount of release() function calls should be the
    //   // same as the dates length.

    //   const remainingBalance = await eq9.balanceOf(timelock.address);
    const remainingBalance = await eq9.balanceOf(timelock.address);
    expect(remainingBalance.toString()).to.be.equal("0");
    // }
  });

  it("should not allow to release after all the releases ", async () => {
    await expect(timelock.release()).to.be.revertedWith("no more schedules");
  });
});
