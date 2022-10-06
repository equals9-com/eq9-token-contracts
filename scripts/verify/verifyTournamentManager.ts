import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0xF56C732429f09C134386BfFD25aF57d2eF8816C0";

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
