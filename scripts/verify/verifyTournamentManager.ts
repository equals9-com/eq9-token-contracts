import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0xa938AF9d64b6DeE5d79BCAC8ad1cB12DD2D6c360";

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
