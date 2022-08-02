import { ethers } from "hardhat";
import { EQ9, TokenMultiTimelock } from "../types";
import { expect } from "chai";
import { timelockConfigs } from "../config/timelockConfig";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

describe("timelocks", function () {
  let eq9: EQ9;
  const timelocks: TokenMultiTimelock[] = [];

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

  it("should deploy each one of these timelocks: sales, harvest, Ido/Edo, Marketing, Social", async () => {
    const [owner] = await ethers.getSigners();

    // in each of the configs, [0] are the dates, [1] is the monthly release, [2] is the total locked.
    for (let i = 0; i < timelockConfigs.length; i++) {
      const [dates, monthlyRelease, totalLocked, name] = timelockConfigs[i];
      const TokenTimeLock = await ethers.getContractFactory(
        "TokenMultiTimelock"
      );

      const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

      const releaseAmounts = releaseTimesUnix.map(() =>
        ethers.utils.parseUnits(String(monthlyRelease), "ether")
      );

      console.log(releaseAmounts);
      const timelock = await TokenTimeLock.deploy(
        eq9.address,
        owner.address,
        releaseTimesUnix,
        releaseAmounts,
        String(name)
      );

      await timelock.deployed();
      timelocks.push(timelock);
      await eq9
        .connect(owner)
        .transfer(
          timelock.address,
          ethers.utils.parseUnits(String(totalLocked), "ether")
        );
    }
  });

  it("should not allow to release before the scheduled date", async () => {
    for (let i = 0; i < timelocks.length; i++) {
      await expect(timelocks[i].release()).to.be.revertedWith(
        "current time is before release"
      );
    }
  });

  it("should have the proper non locked value in wallet after all locks", async () => {
    const [owner] = await ethers.getSigners();
    const circulatingSupply = eq9.balanceOf(owner.address);
    console.log(
      "left circulating supply",
      (await circulatingSupply).toString()
    );
  });

  it("should release tokens at each date", async () => {
    // mine a date that is past all schedules
    await ethers.provider.send("evm_mine", [
      getUnixTime(new Date("01/01/2026")),
    ]);

    for (let i = 0; i < timelocks.length; i++) {
      const name = await timelocks[i].name();

      console.log(`releasing: ${name.toString()} `);

      const startingBalance = await eq9.balanceOf(timelocks[i].address);

      console.log("locked in contract:", startingBalance.toString());

      // each of the timelocks has it's own schedule. The order of the
      // timelocks array represent the same order of the configs.
      // so, the amount of release() function calls should be the
      // same as the dates length.
      for (let j = 0; j < timelockConfigs[i][0].length; j++) {
        const releaseAmount = await timelocks[i].releaseAmounts(j);
        console.log("amount to release in wei ", releaseAmount.toString());
        const tx = await timelocks[i].release();
        const receipt: any = await tx.wait();
        const releaseIndex = ethers.BigNumber.from(
          receipt.events[1].args.releaseIndex
        ).toString();

        console.log("release of index: ", releaseIndex);
      }
      const remainingBalance = await eq9.balanceOf(timelocks[i].address);
      expect(remainingBalance.toString()).to.be.equal("0");
    }
  });

  // it("timelock contract eq9 token balance should be 0", async () => {
  //   // time calculated in seconds. 60 seconds times 60 times 24 to get seconds in a day, times 31
  //   // to get a month + 1 just to be sure that it's past the release

  //   const timelockBalance = await eq9.balanceOf(timelock.address);
  //   expect(timelockBalance.toString()).to.be.equal(
  //     ethers.utils.parseUnits("0", "ether")
  //   );
  // });

  // it("should not allow to release before the scheduled date", async () => {
  //   await expect(timelock.release()).to.be.revertedWith("no more schedules");
  // });
});
