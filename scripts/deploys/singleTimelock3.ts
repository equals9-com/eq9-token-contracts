import { ethers } from "hardhat";
import { TokenMultiTimelock } from "../../types";
import {
  dates,
  beneficiary,
  contractName,
  monthlyRelease,
  // totalLocked,
} from "../../config/personalTimeLocks3";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  const timelocks: TokenMultiTimelock[] = [];

  console.log("address", owner.address);
  console.log("balance", balance.toString());

  const Token = await ethers.getContractFactory("EQ9");
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";
  const eq9 = Token.attach(eq9Address);

  const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

  const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

  const releaseAmounts = releaseTimesUnix.map(() =>
    ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
  );

  const timelock = await TokenTimeLock.deploy(
    eq9.address,
    String(beneficiary),
    releaseTimesUnix,
    releaseAmounts,
    String(contractName)
  );

  await timelock.deployed();

  timelocks.push(timelock);
  console.log("timelock deployed", timelock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
