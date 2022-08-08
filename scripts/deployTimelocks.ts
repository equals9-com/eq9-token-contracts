import { ethers } from "hardhat";
import { timelockConfigs } from "../config/timelockConfig";
import { TokenMultiTimelock } from "../types";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  const timelocks: TokenMultiTimelock[] = [];
  console.log("balance", balance.toString());

  const Token = await ethers.getContractFactory("EQ9");
  const eq9Address = "0x2Fdc13eb83D95952d487306b9e252602085E3426";
  const eq9 = Token.attach(eq9Address);

  for (let i = 0; i < timelockConfigs.length; i++) {
    const [dates, monthlyRelease, totalLocked, name] = timelockConfigs[i];

    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits(String(monthlyRelease), "ether").toString()
    );

    const timelock = await TokenTimeLock.deploy(
      eq9.address,
      owner.address,
      releaseTimesUnix,
      releaseAmounts,
      String(name)
    );

    await timelock.deployed();

    timelocks.push(timelock);
    console.log("timelock deployed", timelock.address);
    const res = await eq9
      .connect(owner)
      .transfer(
        timelock.address,
        ethers.utils.parseUnits(String(totalLocked), "ether")
      );
    console.log("transaction hash", res.hash);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
