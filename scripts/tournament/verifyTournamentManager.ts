import { run } from "hardhat";

async function main() {
  const TournamentManagerAddress = "0xC3355575914B156CFe0519A88eCc501A7017F553";

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
