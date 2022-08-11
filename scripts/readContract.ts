import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  const TokenTimeLock = await ethers.getContractFactory("TokenMultiTimelock");
  const tl = TokenTimeLock.attach("0x249cdf757a499145af6a2b3a3d31ffe9de3c8cd5");

  const beneficiary = await tl.beneficiary();
  const name = await tl.name();
  console.log(beneficiary);
  console.log(name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
