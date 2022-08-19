import { run, ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  const TournamentManagerAddress = "0x871b5Ddef1F59dC5f8A75731c004385F814c1f55";

  const TournamentManager = await ethers.getContractFactory(
    "TournamentManager"
  );
  const tmInstance = TournamentManager.attach(TournamentManagerAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
