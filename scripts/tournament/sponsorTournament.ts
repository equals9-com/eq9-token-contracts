import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("owner ", owner.address);
  console.log("balance ", (await owner.getBalance()).toString());

  const tournamentId = "175";

  const TournamentManagerAddress = "0x59a3aB823c63268CBfDD13476031a47E07f179e7";
  const eq9Adress = "0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6";

  const TournamentManager = await ethers.getContractFactory(
    "TournamentManager"
  );
  const EQ9 = await ethers.getContractFactory("EQ9");

  const eq9 = EQ9.attach(eq9Adress);

  const tmInstance = TournamentManager.attach(TournamentManagerAddress);

  const res = await tmInstance.tournaments(tournamentId);

  console.log("general json", res);
  console.log("token fee", res.tokenFee.toString());

  const tx = await eq9.approve(
    TournamentManagerAddress,
    ethers.utils.parseEther("6000")
  );
  console.log(tx.hash);

  // const tx2 = await tmInstance.addPrizeERC20(
  //   tournamentId,
  //   ethers.utils.parseEther("6000")
  // );

  // const result2 = await tx2.wait(2);

  // console.log("sponsored in", result2.transactionHash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
