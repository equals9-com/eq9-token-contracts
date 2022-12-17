import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EQ9, TournamentManager } from "../../../types";

describe("Tournament with a ERC20 sponsors and free join", function () {
  let tournamentManager: TournamentManager;
  let eq9: EQ9;
  let tournamentId: string;
  let accounts: SignerWithAddress[];

  it("should create an tournament with a generic erc20 token", async function () {
    accounts = await ethers.getSigners();
    const owner = accounts[0];

    const EQ9 = await ethers.getContractFactory("EQ9");

    eq9 = await EQ9.deploy();

    await eq9.deployed();

    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    const tx = await tournamentManager.createTournament(
      ethers.utils.parseEther("0"),
      eq9.address
    );
    const rc = await tx.wait(); // 0ms, as tx is already confirmed
    const event = rc.events?.find(
      (event: any) => event.event === "TournamentCreated"
    );
    expect(event?.args?.id).to.exist;
    tournamentId = event?.args?.id;
  });

  it("should distribute ERC20 token among wallets", async () => {
    for (let i = 1; i < accounts.length; i++) {
      await eq9.transfer(accounts[i].address, ethers.utils.parseEther("100"));
    }
  });

  it("should be able to subscribe many users for free", async () => {
    for (let i = 1; i < 9; i++) {
      await eq9
        .connect(accounts[i])
        .approve(tournamentManager.address, ethers.utils.parseEther("10"));

      await tournamentManager
        .connect(accounts[i])
        .joinERC20(tournamentId, accounts[i].address);
    }

    expect(await tournamentManager.getPlayersLength(tournamentId)).to.be.equal(
      8
    );
  });
});
