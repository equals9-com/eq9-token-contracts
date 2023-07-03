import { run } from "hardhat";

async function main() {
  const mockusdtAddress = "0x157Bd22b6848A42ddBeF467cB6B0d0A2C806E01B";

  await run("verify:verify", {
    address: mockusdtAddress,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
