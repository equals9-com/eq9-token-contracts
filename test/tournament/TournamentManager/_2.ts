import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager } from "../../../types";
const { BigNumber } = ethers;

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
      value: ethers.utils.parseEther("90"),
    });
  });

  it("should allow many addresses to join", async function () {
    const accounts = await ethers.getSigners();

    for (let i = 1; i < 10; i++) {
      await tournamentManager
        .connect(accounts[i])
        .join(id, accounts[i].address, { value: ethers.utils.parseEther("0") });
    }
    const balance = await tournamentManager.provider.getBalance(
      tournamentManager.address
    );
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("90").toString()
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

    // 50 because 4 players received 10 each and the accumulated prize was 90
    expect(balance.toString()).to.be.equal(
      ethers.utils.parseEther("50").toString()
    );
  });

  it("should not allow receiver wallets to claim funds if shares of that user is zero", async function () {
    const accounts = await ethers.getSigners();

    await expect(
      tournamentManager.release(
        accounts[11].address,
        await tournamentManager.shares(accounts[11].address)
      )
    ).to.be.revertedWith("account has no shares");
  });

  it("should not allow receiver wallets to claim funds if the amount is greater than the available share", async function () {
    const accounts = await ethers.getSigners();

    const payees = [accounts[11].address];
    const shares = [ethers.utils.parseEther("10")];

    await tournamentManager.splitPayment(id, payees, shares);

    await expect(
      tournamentManager.release(
        accounts[11].address,
        ethers.utils.parseEther("99999")
      )
    ).to.be.revertedWith("amount exceeds shares");
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
      ethers.utils.parseEther("10").toString()
    );
  });

  it("should revert in case distributed funds between addresses is greater than the amount allocated to the tournament", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 10; i < 15; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("500"));
    }

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("Shares greater than accumulated token reward");
  });

  it("should not distribute funds between addresses if payees and shares are not of same length", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 10; i < 15; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("500"));
    }
    payees.push(accounts[15].address);

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("payees and shares length mismatch");
  });

  it("should not distribute funds between addresses if payees length is zero", async function () {
    const payees: string[] = [];
    const shares: string[] = [];

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("no payees");
  });

  it("should not distribute funds between addresses if a payee is address zero", async function () {
    const payees = [ethers.constants.AddressZero];
    const shares = [ethers.utils.parseEther("10")];

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("PaymentSplitter: account is the zero address");
  });

  it("should not distribute funds between addresses if a share is zero", async function () {
    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("0"));
    }

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("PaymentSplitter: shares are 0");
  });

  it("should not be able to split payments with no players joined to the tournament", async () => {
    const Tournament = await ethers.getContractFactory("TournamentManager");
    tournamentManager = await Tournament.deploy();
    await tournamentManager.deployed();

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

    const accounts = await ethers.getSigners();

    const payees = [];
    const shares = [];

    for (let i = 1; i < 5; i++) {
      payees.push(accounts[i].address);
      shares.push(ethers.utils.parseEther("10"));
    }

    await expect(
      tournamentManager.splitPayment(id, payees, shares)
    ).to.be.revertedWith("No players joined the tournament");
  });
});
