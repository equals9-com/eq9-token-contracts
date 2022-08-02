import { ethers, run } from "hardhat";

import { timelockConfigs } from "../config/timelockConfig";

const eq9Address = "0x722F74e982D312Ea3dA57e5571f96dC4C8C3E2eB";
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

  await run("verify:verify", {
    address: "0x94DDD68d44B6061B39253854dcDccFB746ca3e48",
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
