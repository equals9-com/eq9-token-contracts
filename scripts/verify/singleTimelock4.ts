import { ethers, run } from "hardhat";

import {
  dates,
  beneficiary,
  contractName,
  monthlyRelease,
} from "../../config/personalTimeLocks4";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  const address = "0xBFc78F1ed9560EF5F606E321755455ff4e5e3913";

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
