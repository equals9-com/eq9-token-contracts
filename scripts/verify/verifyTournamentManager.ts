import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0xcF4CFA5E18A99427237E88490B6539b81668C49A";

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
