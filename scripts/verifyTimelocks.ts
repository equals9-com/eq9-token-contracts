import { ethers, run } from "hardhat";

import { timelockConfigs } from "../config/timelockConfig";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();
  const [dates, monthlyRelease, name] = timelockConfigs[0];

  const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

  const releaseAmounts = releaseTimesUnix.map(() =>
    ethers.utils.parseUnits(String(monthlyRelease), "ether")
  );

  const eq9Address = "0x63aEB1ECE758F64B24b9386b2ba4D15Ef045712B";
  await run("verify:verify", {
    address: "0x1b1a8E73333C246ff56f082D4fDE7F6499E84Ee5",
    constructorArguments: [
      eq9Address,
      owner.address,
      releaseTimesUnix,
      releaseAmounts,
      String(name),
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
