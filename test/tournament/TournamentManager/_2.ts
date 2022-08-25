import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { TournamentManager } from "../../../types";
const { BigNumber } = ethers;

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Tournament with a prize added and free subscription ", async function () {
  let tournamentManager: TournamentManager;
  let id: string;

  it("should deploy the tournamentManager", async function () {
    const [owner] = await ethers.getSigners();
    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    await tournamentManager.deployed();
  });

  it("should create an tournament with 0 subscription", async function () {
    const [owner] = await ethers.getSigners();
    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.connect(owner).deploy();
    const tx = await tournamentManager.createTournament(
      ethers.utils.parseEther("0"),
      ethers.constants.AddressZero
    );
    const rc = await tx.wait(); // 0ms, as tx is already confirmed
    const event = rc.events?.find(
      (event: any) => event.event === "TournamentCreated"
    );
    const args = event?.args;
    id = BigNumber.from(args?.id).toString();
  });

  it("should allow a wallet to add a prize", async function () {
    await tournamentManager.addPrize(id, {
      value: ethers.utils.parseEther("1000"),
    });
  });

  it("should allow many addresses to join", async function () {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 10; i++) {
      await tournamentManager
        .connect(accounts[i])
        .join(id, { value: ethers.utils.parseEther("0") });
    }
    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("1000").toString()
    );
  });

  it("the admin should be able to split rewards", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("10"));
    }

    await tournamentManager.splitPayment(id, payees, shares);
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

    // 960 because 4 players received 10 each and the accumulated prize was 1000
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("960").toString()
    );
  });

  it("should not allow receiver wallets to claim funds if shares of that user is zero", async function () {
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager.release(
        accounts[11].address,
        await tournamentManager.shares(accounts[11].address)
      )
    ).to.be.rejected;
  });

  it("should not allow receiver wallets to claim funds if the amount is greater than the available share", async function () {
    const accounts = await ethers.getSigners();

    const payees = [accounts[4].address];
    const shares = [ethers.utils.parseEther("10")];

    await tournamentManager.splitPayment(id, payees, shares);

    await expect(
      tournamentManager.release(
        accounts[4].address,
        ethers.utils.parseEther("99999")
      )
    ).to.be.rejected;
  });

  it("the admin should be able to split rewards once again, until all funds are distributed", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("10"));
    }

    await tournamentManager.splitPayment(id, payees, shares);

    for (let i = 1; i < 5; i++) {
      await tournamentManager.release(
        accounts[i].address,
        await tournamentManager.shares(accounts[i].address)
      );
    }

    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );

    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("910").toString()
    );
  });

  it("it should revert in case distributed funds between addresses is greater than the amount allocated to the tournament", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("500"));
    }

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("mismatch between accumulated and distributed");
  });

  it("should not distribute funds between addresses if payees and shares are not of same length", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("500"));
    }
    payees.push(accounts[5].address);

    await expect(tournamentManager.splitPayment(id, payees, shares)).to.be
      .rejected;
  });

  it("should not distribute funds between addresses if payees length is zero", async function () {
    const payees: string[] = [];
    const shares: string[] = [];

    await expect(tournamentManager.splitPayment(id, payees, shares)).to.be
      .rejected;
  });

  it("should not distribute funds between addresses if a payee is address zero", async function () {
    const payees = [ethers.constants.AddressZero];
    const shares = [ethers.utils.parseEther("10")];

    await expect(tournamentManager.splitPayment(id, payees, shares)).to.be
      .rejected;
  });

  it("should not distribute funds between addresses if a share is zero", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("0"));
    }

    await expect(tournamentManager.splitPayment(id, payees, shares)).to.be
      .rejected;
  });
});
