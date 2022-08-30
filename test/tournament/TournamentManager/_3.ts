import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { EQ9, TournamentManager } from "../../../types";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Tournament with a ERC20 token as subscription", function () {
  let tournamentManager: TournamentManager;
  let eq9: EQ9;
  let tournamentId: string;
  let accounts: SignerWithAddress[];

  it("should create an tournament with a generic rc20 token", async function () {
    accounts = await ethers.getSigners();
    const owner = accounts[0];

    const EQ9 = await ethers.getContractFactory("EQ9");

    eq9 = await EQ9.deploy();

    await eq9.deployed();

    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    const tx = await tournamentManager.createTournament(
      ethers.utils.parseEther("10"),
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

  it("should be able to subscribe many users with an ERC20", async () => {
    for (let i = 1; i < 9; i++) {
      await eq9
        .connect(accounts[i])
        .approve(tournamentManager.address, ethers.utils.parseEther("10"));

      await tournamentManager.connect(accounts[i]).joinERC20(tournamentId);
    }

    expect(await tournamentManager.getPlayersLength(tournamentId)).to.be.equal(
      8
    );
  });

  it("should not be able to subscribe a player if the tournament is not in a waiting state", async () => {
    await tournamentManager.setStartedState(tournamentId);

    await expect(tournamentManager.connect(accounts[9]).joinERC20(tournamentId))
      .to.be.rejected;

    await tournamentManager.setWaitingState(tournamentId);
  });

  it("should not be able to subscribe a player the amount is incorrect", async () => {
    await expect(tournamentManager.connect(accounts[9]).joinERC20(tournamentId))
      .to.be.rejected;
  });

  it("should not be able to subscribe a player twice in the same tournament", async () => {
    await eq9
      .connect(accounts[9])
      .approve(tournamentManager.address, ethers.utils.parseEther("10"));

    await tournamentManager.connect(accounts[9]).joinERC20(tournamentId);

    await expect(tournamentManager.connect(accounts[9]).joinERC20(tournamentId))
      .to.be.rejected;
  });

  it("should allow a wallet to add a prize using erc20 token", async function () {
    await eq9.approve(tournamentManager.address, ethers.utils.parseEther("10"));

    await tournamentManager.addPrizeERC20(
      tournamentId,
      ethers.utils.parseEther("9")
    );
  });

  it("should not allow a wallet to add a prize using token if is lower or equal to zero using ERC20", async function () {
    await expect(
      tournamentManager.addPrizeERC20(
        tournamentId,
        ethers.utils.parseEther("0")
      )
    ).to.be.rejected;
  });

  it("should not allow a wallet to add a prize using token if the tournament state is different from waiting using ERC20", async function () {
    await tournamentManager.setStartedState(tournamentId);

    await expect(
      tournamentManager.addPrizeERC20(
        tournamentId,
        ethers.utils.parseEther("10")
      )
    ).to.be.rejected;

    await tournamentManager.setWaitingState(tournamentId);
  });

  it("should not allow subscribe a tournament with network token if a ERC20 is already settled up", async () => {
    await expect(
      tournamentManager
        .connect(accounts[17])
        .join(tournamentId, { value: ethers.utils.parseEther("10") })
    ).to.be.rejected;
  });

  it("should be able to allow a user to pay for someone else to join with ERC20", async () => {
    await eq9
      .connect(accounts[18])
      .approve(tournamentManager.address, ethers.utils.parseEther("10"));

    await tournamentManager
      .connect(accounts[18])
      .joinSomeoneElseERC20(
        tournamentId,
        accounts[19].address,
        ethers.utils.parseEther("10")
      );
  });

  it("should not be able to allow a user to pay for someone else to join if tournament state is not waiting for ERC20", async () => {
    await tournamentManager.setStartedState(tournamentId);

    await expect(
      tournamentManager.joinSomeoneElseERC20(
        tournamentId,
        accounts[15].address,
        ethers.utils.parseEther("10")
      )
    ).to.be.rejected;

    await tournamentManager.setWaitingState(tournamentId);
  });

  it("should not be able to allow a user to pay for someone else to join if the value is incorrect", async () => {
    await expect(
      tournamentManager.joinSomeoneElseERC20(
        tournamentId,
        accounts[15].address,
        ethers.utils.parseEther("9")
      )
    ).to.be.rejected;
  });

  it("should not be able to allow a user to pay for someone else to join if the user is already joined", async () => {
    await expect(
      tournamentManager.joinSomeoneElseERC20(
        tournamentId,
        accounts[1].address,
        ethers.utils.parseEther("10")
      )
    ).to.be.rejected;
  });

  it("the admin of a tournament should be able to cancel a tournament and it should refund every wallet with erc20", async function () {
    await tournamentManager.connect(accounts[0]).cancelTournament("0");

    const totalAccRewardCancelled = (
      await tournamentManager.tournaments(tournamentId)
    ).totalAccTokenReward;
    expect(totalAccRewardCancelled.toString()).to.be.equal(
      ethers.utils.parseEther("0").toString()
    );
  });
});
