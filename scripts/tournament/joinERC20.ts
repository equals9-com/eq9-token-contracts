import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const TournamentManagerAddress = "0xC3355575914B156CFe0519A88eCc501A7017F553";
  const eq9Adress = "0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B";
  const TournamentManager = await ethers.getContractFactory(
    "TournamentManager"
  );

  const EQ9 = await ethers.getContractFactory("EQ9");

  const tmInstance = TournamentManager.attach(TournamentManagerAddress);
  const eq9 = EQ9.attach(eq9Adress);

  const res = await tmInstance.tournaments("0");

  console.log("general json", res);
  console.log("token fee", res.tokenFee.toString());
  // await eq9.approve(TournamentManagerAddress, res.tokenFee);

  // await tmInstance.joinERC20("0");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
