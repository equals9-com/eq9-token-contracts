import { ethers, run } from "hardhat";

import { timelockConfigs } from "../../config/timelockConfig";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  const addresses = [
    "0x90E49f5fFCe602ec7Aefd7471cc307fD2C901061",
    "0xaA6376064C8351C961077B9d4d1aA6365e71C99f",
    "0x28C1a012a5c6de345F6eaC4BC41F31473aaC1A26",
    "0x6860e99e12106973D55308aC967F9B1554750ebC",
    "0x249cdF757A499145AF6a2b3a3d31Ffe9De3C8cd5",
  ];

  for (let i = 0; i < timelockConfigs.length; i++) {
    try {
      const [dates, monthlyRelease, , name, beneficiaryAddress] =
        timelockConfigs[i];

      const releaseTimesUnix = (dates as Date[]).map((d) => getUnixTime(d));

      const releaseAmounts = releaseTimesUnix.map(() =>
        ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
      );
      await run("verify:verify", {
        address: addresses[i],
        constructorArguments: [
          eq9Address,
          beneficiaryAddress,
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
