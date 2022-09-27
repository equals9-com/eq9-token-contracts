import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0x1D04657D4dC9f544A2BC3030011EA2b0f121C1Fc";

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
