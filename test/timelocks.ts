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

  it("Should not deploy timelock on array length mismatch", async function () {
    const [dates, monthlyRelease, , name, beneficiaryAddress] =
      timelockConfigs[0];
    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    const releaseTimesUnix = (dates as Date[]).map((date) => getUnixTime(date));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits(String(monthlyRelease), "ether")
    );

    releaseAmounts.pop();

    expect(
      TokenTimeLock.deploy(
        eq9.address,
        String(beneficiaryAddress),
        releaseTimesUnix,
        releaseAmounts,
        String(name)
      )
    ).to.be.revertedWith("length mismatch between arrays");
  });

  it("should deploy each one of these timelocks: sales, harvest, Ido/Edo, Marketing, Social", async () => {
    const [owner] = await ethers.getSigners();

    // in each of the configs, [0] are the dates, [1] is the monthly release, [2] is the total locked.
    for (let i = 0; i < timelockConfigs.length; i++) {
      const [dates, monthlyRelease, totalLocked, name, beneficiaryAddress] =
        timelockConfigs[i];
      const TokenTimeLock = await ethers.getContractFactory(
        "TokenMultiTimelock"
      );

      const releaseTimesUnix = (dates as Date[]).map((date) =>
        getUnixTime(date)
      );

      const releaseAmounts = releaseTimesUnix.map(() =>
        ethers.utils.parseUnits(String(monthlyRelease), "ether")
      );

      console.log(releaseAmounts);
      const timelock = await TokenTimeLock.deploy(
        eq9.address,
        String(beneficiaryAddress),
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

    // TODO; requires validation with financial
    expect((await circulatingSupply).toString()).to.be.equal(
      ethers.utils.parseUnits("383832360", "ether")
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

  it("should not allow to release after all the releases ", async () => {
    for (let i = 0; i < timelocks.length; i++) {
      await expect(timelocks[i].release()).to.be.revertedWith(
        "no more schedules"
      );
    }
  });

  it("amount in each  beneficiary wallet should again be the total supply ", async () => {
    // TODO: count amounts in beneficiary wallets and owner wallet to be 1800000000
    // const [owner] = await ethers.getSigners();
    // const balance = eq9.balanceOf(owner.address);
    // expect((await balance).toString()).to.be.equal(
    //   ethers.utils.parseUnits("1800000000", "ether")
    // );
  });
});
