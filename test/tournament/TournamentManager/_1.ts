import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { TournamentManager } from "../../../types";
const { BigNumber } = ethers;

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Tournament with native token as subscription", async function () {
  let tournamentManager: TournamentManager;
  let id: string;

  it("should deploy the tournamentManager", async function () {
    const [owner] = await ethers.getSigners();
    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    await tournamentManager.deployed();
  });

  it("should create an tournament", async function () {
    const [owner] = await ethers.getSigners();
    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    const tx = await tournamentManager.createTournament(
      ethers.utils.parseEther("10"),
      ethers.constants.AddressZero
    );
    const rc = await tx.wait(); // 0ms, as tx is already confirmed
    const event = rc.events?.find(
      (event: any) => event.event === "TournamentCreated"
    );
    const args = event?.args;
    id = BigNumber.from(args?.id).toString();
  });

  it("should allow many addresses to join", async function () {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 10; i++) {
      await tournamentManager
        .connect(accounts[i])
        .join(id, { value: ethers.utils.parseEther("10") });
    }
    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("90").toString()
    );
  });

  it("should be able to verify if address joined", async function () {
    const accounts = await ethers.getSigners();

    await tournamentManager.subscription(id, accounts[2].address);
  });

  it("Address with wrong payment shouldn't be able to join", async function () {
    const accounts = await ethers.getSigners();
    await expect(
      tournamentManager
        .connect(accounts[11])
        .join(id, { value: ethers.utils.parseEther("9") })
    ).to.be.revertedWith("amount inserted is not the required ticket price");
  });

  it("should allow a joined address to exit and receive it's funds back", async function () {
    const accounts = await ethers.getSigners();
    await tournamentManager.connect(accounts[1]).exit(id);
    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("80").toString()
    );
  });

  it("should fetch the current state", async function () {
    (await tournamentManager.tournaments(id)).state;
  });

  it("should allow only the admin to set the state as Started", async function () {
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager.connect(accounts[1]).setStartedState(id)
    ).to.be.revertedWith(
      "only the admin of this tournament can handle this function"
    );

    await tournamentManager.connect(accounts[0]).setStartedState(id);

    const currentState = (await tournamentManager.tournaments(id)).state;
    expect(currentState.toString()).to.be.equal("1");
  });

  it("should not allow to exit() if state is not Waiting anymore", async function () {
    const accounts = await ethers.getSigners();
    await expect(
      tournamentManager.connect(accounts[2]).exit(id)
    ).to.be.revertedWith("cannot exit if state is not waiting");
  });

  it("should not allow to exit() if player already exited", async function () {
    const accounts = await ethers.getSigners();
    await expect(
      tournamentManager.connect(accounts[1]).exit(id)
    ).to.be.revertedWith("player must have paid the entire fee");
  });

  it("should be able to check if user paid the fee", async function () {
    const accounts = await ethers.getSigners();

    const paid = await tournamentManager.checkPayment(id, accounts[3].address);
    expect(paid).to.be.equal(true);
    const paid2 = await tournamentManager.checkPayment(
      id,
      accounts[12].address
    );
    expect(paid2).to.be.equal(false);
  });

  it("the admin should be able to split rewards", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("10"));
    }

    await tournamentManager
      .connect(accounts[0])
      .splitPayment(id, payees, shares);
  });

  it("should allow receiver wallets to claim funds", async function () {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 5; i++) {
      await tournamentManager.release(
        accounts[i].address,
        await tournamentManager.shares(accounts[i].address)
      );
    }

    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );

    // 40 because 1 player joined and it distributed funds to the 4 others
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("40").toString()
    );
  });

  it("should be able to create a new tournament", async function () {
    const tx = await tournamentManager.createTournament(
      ethers.utils.parseEther("10"),
      ethers.constants.AddressZero
    );
    const rc = await tx.wait(); // 0ms, as tx is already confirmed
    const event = rc.events?.find(
      (event: any) => event.event === "TournamentCreated"
    );
    const args = event?.args;
    id = BigNumber.from(args?.id).toString();
    expect(id.toString()).to.be.equal("1");
  });

  it("Some players should join this new tournament", async function () {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 10; i++) {
      await tournamentManager
        .connect(accounts[i])
        .join(id, { value: ethers.utils.parseEther("10") });
    }
    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );

    // 130 because 9 more players joined and it was only splitted 40 ether out of the 80 available
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("130").toString()
    );

    const totalAccReward2 = (await tournamentManager.tournaments(id))
      .totalAccTokenReward;

    expect(totalAccReward2.toString()).to.be.equal(
      ethers.utils.parseEther("90").toString()
    );
  });

  it("admin should be able to remove a player", async function () {
    const accounts = await ethers.getSigners();

    await tournamentManager.removePlayer(id, accounts[2].address);

    const paymentDone = await tournamentManager.checkPayment(
      id,
      accounts[2].address
    );

    expect(paymentDone).to.be.equal(false);

    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );

    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("120").toString()
    );
  });

  it("should not be able to join a tournament if the state is diferent from waiting", async () => {
    await tournamentManager.setStartedState(id);
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager
        .connect(accounts[19])
        .join(id, { value: ethers.utils.parseEther("10") })
    ).to.be.reverted;

    await tournamentManager.setWaitingState(id);
  });

  it("should not be able to a player(address) join twice in a same tournament", async () => {
    const accounts = await ethers.getSigners();

    await tournamentManager
      .connect(accounts[19])
      .join(id, { value: ethers.utils.parseEther("10") });

    await expect(
      tournamentManager
        .connect(accounts[19])
        .join(id, { value: ethers.utils.parseEther("10") })
    ).to.be.reverted;
  });

  it("should not be able to join with erc20 token if a tournament is already using network token", async () => {
    const accounts = await ethers.getSigners();

    await expect(tournamentManager.connect(accounts[19]).joinERC20(id)).to.be
      .reverted;
  });

  it("Some of the joined players should exit", async function () {
    const accounts = await ethers.getSigners();

    await tournamentManager.connect(accounts[1]).exit(id);

    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );

    // 120 because there was a removed player from the admin
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("120").toString()
    );

    const totalAccReward2 = (await tournamentManager.tournaments(id))
      .totalAccTokenReward;

    // 80 because there was a removed player from the admin
    expect(totalAccReward2.toString()).to.be.equal(
      ethers.utils.parseEther("80").toString()
    );
  });

  it("should allow a wallet to add a prize using token", async function () {
    const accounts = await ethers.getSigners();

    await tournamentManager
      .connect(accounts[17])
      .addPrize(id, { value: ethers.utils.parseEther("9") });
  });

  it("should not allow a wallet to add a prize using token if is lower or equal to zero", async function () {
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager
        .connect(accounts[17])
        .addPrize(id, { value: ethers.utils.parseEther("0") })
    ).to.be.reverted;
  });

  it("should not allow a wallet to add a prize using token if the tournament state is different from waiting", async function () {
    const accounts = await ethers.getSigners();

    await tournamentManager.setStartedState(id);

    await expect(
      tournamentManager
        .connect(accounts[17])
        .addPrize(id, { value: ethers.utils.parseEther("10") })
    ).to.be.reverted;

    await tournamentManager.setWaitingState(id);
  });

  it("should be able to allow a user to pay for someone else to join", async () => {
    const accounts = await ethers.getSigners();

    await tournamentManager.joinSomeoneElse(id, accounts[18].address, {
      value: ethers.utils.parseEther("10"),
    });
  });

  it("should not be able to allow a user to pay for someone else to join if tournament state is not waiting", async () => {
    await tournamentManager.setStartedState(id);

    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager.joinSomeoneElse(id, accounts[18].address, {
        value: ethers.utils.parseEther("10"),
      })
    ).to.be.reverted;

    await tournamentManager.setWaitingState(id);
  });

  it("should not be able to allow a user to pay for someone else to join if the value is incorrect", async () => {
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager.joinSomeoneElse(id, accounts[18].address, {
        value: ethers.utils.parseEther("9"),
      })
    ).to.be.reverted;
  });

  it("should not be able to allow a user to pay for someone else to join if the user is already joined", async () => {
    const accounts = await ethers.getSigners();

    await tournamentManager
      .connect(accounts[1])
      .join(id, { value: ethers.utils.parseEther("10") });

    await expect(
      tournamentManager.joinSomeoneElse(id, accounts[1].address, {
        value: ethers.utils.parseEther("10"),
      })
    ).to.be.reverted;
  });

  it("should be able to set waiting state giving its tournament id", async () => {
    await tournamentManager.setWaitingState(id);
  });

  it("should be able to set started state giving its tournament id", async () => {
    await tournamentManager.setStartedState(id);
  });

  it("the admin of a tournament should be able to cancel a tournament and it should refund every wallet", async function () {
    await tournamentManager.cancelTournament(id);

    const totalAccRewardCancelled = (await tournamentManager.tournaments(id))
      .totalAccTokenReward;

    expect(totalAccRewardCancelled.toString()).to.be.equal(
      ethers.utils.parseEther("0").toString()
    );
  });

  it("should not be able to cancel a tournament if totalAccTokenReward is zero", async function () {
    await expect(tournamentManager.cancelTournament(id)).to.be.revertedWith(
      "Tournament has already ended"
    );
  });

  it("should be able to check version", async () => {
    expect(await tournamentManager.version()).to.be.equal("1.5.0");
  });

  it("should not allow a non admin user to set waiting state giving its tournament id", async () => {
    const accounts = await ethers.getSigners();
    await expect(tournamentManager.connect(accounts[1]).setWaitingState(id)).to
      .be.reverted;
  });

  it("should not allow a non admin user to set started state giving its tournament id", async () => {
    const accounts = await ethers.getSigners();
    await expect(tournamentManager.connect(accounts[1]).setStartedState(id)).to
      .be.reverted;
  });

  it("should not allow non owner to pause", async () => {
    const accounts = await ethers.getSigners();
    await expect(
      tournamentManager.connect(accounts[1]).pause()
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should allow the owner to pause", async () => {
    await tournamentManager.pause();
  });

  it("should not allow tournament creation if contract is paused", async () => {
    await expect(
      tournamentManager.createTournament("10", ethers.constants.AddressZero)
    ).to.be.revertedWith("Pausable: paused");
  });

  it("should allow the owner to unpause", async () => {
    await tournamentManager.unpause();
  });
});
