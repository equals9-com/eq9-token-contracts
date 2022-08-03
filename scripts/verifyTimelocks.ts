import { ethers, run } from "hardhat";

import { timelockConfigs } from "../config/timelockConfig";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();
  const [dates, monthlyRelease, , name] = timelockConfigs[3];

  const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

  const releaseAmounts = releaseTimesUnix.map(() =>
    ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
  );

  const eq9Address = "0x92Eb8508B3fE93832B0D3427cD19bf6E5df45654";
  await run("verify:verify", {
    address: " 0x5a5eb73be1c2217b0bde18a9f768910d33171759",
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
