import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  const balance = await owner.getBalance();
  console.log("current balance", balance.toString());
  console.log("using wallet:", owner.address);

  const TournamentManager = await ethers.getContractFactory(
    "TournamentManager"
  );
  const tm = await TournamentManager.deploy();

  await tm.deployed();
  console.log("tournamentManager deployed to:", tm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
