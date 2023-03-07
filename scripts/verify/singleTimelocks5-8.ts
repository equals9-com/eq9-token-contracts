import { ethers, run } from "hardhat";
import { timelocks } from "../../config/timelocks5to8Union";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  const addresses = [
    "0xC9B1D9335BE15625Ddf91EBb848cEeEDc546B02E",
    "0xEdd4a98aC93fcfcCd5226a3daA2DcBb37b94c4AA",
    "0x1226a31008C316FfE800Dd210a19083A4B0Ed9C7",
    "0x812E90077b6011b907EDF6Db1383EF33cA8EA257",
  ];

  for (const [index, timelock] of timelocks.entries()) {
    const { dates, monthlyRelease, beneficiary, contractName } = timelock;
    const releaseAmounts = dates.map(() =>
      ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
    );
    const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

    await run("verify:verify", {
      address: addresses[index],
      constructorArguments: [
        eq9Address,
        beneficiary,
        releaseTimesUnix,
        releaseAmounts,
        String(contractName),
      ],
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
