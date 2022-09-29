import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0xCC17F11d9B31E38c0162824efBB05A882140E743";

  try {
    await run("verify:verify", {
      address: TournamentManagerAddress,
    });
  } catch (e) {
    console.log(e);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
