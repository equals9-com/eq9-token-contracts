import { ethers, run } from "hardhat";
import { timelocks } from "../../config/timelocks5to8Union";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  const addresses = [
    // Service Provider: H.FC.A
    "0x812f90cB818b4DB72B3473F4aAFF75331Eb23111",

    // Service Provider: H.F.L.H
    "0x9044ae81385624b08A4460C5A22A9D10E44167dA",

    // Service Provider: H.F.J.D.B
    "0x20dd5A41B8D70F079A49657b1A59ceB444c8F6C7",

    // Service Provider: H.F.A.N
    "0xBe61D45Bfd587EcE3DFA3303BB519F25e1A00fa8",
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
