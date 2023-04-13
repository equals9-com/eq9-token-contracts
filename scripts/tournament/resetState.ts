import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const tournamentId = "189";

  const TournamentManagerAddress = "0x59a3aB823c63268CBfDD13476031a47E07f179e7";
  const TournamentManager = await ethers.getContractFactory(
    "TournamentManager"
  );

  const tmInstance = TournamentManager.attach(TournamentManagerAddress);

  const res = await tmInstance.tournaments(tournamentId);

  console.log("general json", res);
  console.log("token fee", res.tokenFee.toString());

  const txx = await tmInstance.setWaitingState(tournamentId);
  await txx.wait();

  // const tx = await tmInstance.setStartedState(tournamentId);

  // await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
