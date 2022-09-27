import { run } from "hardhat";

async function main() {
  const eq9Address = "0x3963a400b42377376d6c3d92Ddf2d6288D8EE0d6";

  try {
    await run("verify:verify", {
      address: "0xC5A3B0B59d4Ed2AB73B5f3fEf956525F9d5ee2e7",
      constructorArguments: [eq9Address],
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
