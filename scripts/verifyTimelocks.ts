import { ethers, run } from "hardhat";

import { timelockConfigs } from "../config/timelockConfig";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();

  const eq9Address = "0x2Fdc13eb83D95952d487306b9e252602085E3426";

  const addresses = [
    "0x0b7eC9d558A7B1505C84CAaf8Ee20479326F7917",
    "0x2DE96736a7e679bA5ABaE7e84dDf0D0DC1E43AfA",
    "0xF0e305856652F2f493eCd0f7243b1414DA68C7f0",
    "0xc6cB4e65B2E07eED241C2f7147038e6E9fF66Be4",
    "0x43ceEA8398be99ECAf2245872d2C8E004c8B343c",
  ];

  for (let i = 0; i < timelockConfigs.length; i++) {
    try {
      const [dates, monthlyRelease, , name] = timelockConfigs[i];

      const releaseTimesUnix = (dates as Date[]).map((d) => getUnixTime(d));

      const releaseAmounts = releaseTimesUnix.map(() =>
        ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
      );
      await run("verify:verify", {
        address: addresses[i],
        constructorArguments: [
          eq9Address,
          owner.address,
          releaseTimesUnix,
          releaseAmounts,
          String(name),
        ],
      });
    } catch (e) {
      console.log(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
