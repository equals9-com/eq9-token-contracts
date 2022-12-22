import { ethers, run } from "hardhat";

import {
  dates,
  beneficiary,
  contractName,
  monthlyRelease,
} from "../../config/personalTimeLocks3";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  const address = "0x706f999f4d5cE1Ce3d22a07035fcE5cda55f1473";

  const releaseAmounts = dates.map(() =>
    ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
  );
  const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

  await run("verify:verify", {
    address,
    constructorArguments: [
      eq9Address,
      beneficiary,
      releaseTimesUnix,
      releaseAmounts,
      String(contractName),
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
