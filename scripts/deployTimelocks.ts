import { ethers } from "hardhat";
import { timelockConfigs } from "../config/timelockConfig";
import { TokenMultiTimelock } from "../types";

const eq9Address = "0x722F74e982D312Ea3dA57e5571f96dC4C8C3E2eB";
const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  const timelocks: TokenMultiTimelock[] = [];
  console.log("balance", balance.toString());

  const Token = await ethers.getContractFactory("EQ9");
  const eq9 = Token.attach(eq9Address);

  for (let i = 0; i < timelockConfigs.length; i++) {
    const [dates, monthlyRelease, totalLocked, name] = timelockConfigs[i];
    console.log("contract name", name);

    const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");

    const releaseTimesUnix = (dates as Date[]).map((i) => getUnixTime(i));

    const releaseAmounts = releaseTimesUnix.map(() =>
      ethers.utils.parseUnits(String(monthlyRelease), "ether")
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
    await eq9
      .connect(owner)
      .transfer(
        timelock.address,
        ethers.utils.parseUnits(String(totalLocked), "ether")
      );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
