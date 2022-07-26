import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { EQ9, Staking } from "../../types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Staking with a ERC20 token (EQ9)", function () {
  let eq9: EQ9;
  let stakingContract: Staking;
  let accounts: SignerWithAddress[];

  it("should deploy the ERC20 token", async function () {
    accounts = await ethers.getSigners();

    const EQ9 = await ethers.getContractFactory("EQ9");

    eq9 = await EQ9.deploy();

    await eq9.deployed();
  });

  it("should distribute ERC20 token among wallets", async () => {
    for (let i = 1; i < accounts.length; i++) {
      await eq9.transfer(accounts[i].address, ethers.utils.parseEther("100"));
    }
  });

  it("should be able to deploy staking contract", async () => {
    const Staking = await ethers.getContractFactory("Staking");

    stakingContract = await Staking.deploy(eq9.address);

    await stakingContract.deployed();
  });

  it("should be able to approve eq9 to staking contract for all accounts", async () => {
    for (let index = 1; index < accounts.length; index++) {
      await eq9
        .connect(accounts[index])
        .approve(stakingContract.address, ethers.utils.parseEther("100"));
    }
  });

  it("should allow wallets to stake", async () => {
    await stakingContract
      .connect(accounts[1])
      .stake(ethers.utils.parseEther("1"), accounts[2].address);
    await stakingContract
      .connect(accounts[1])
      .stake(ethers.utils.parseEther("2"), accounts[3].address);
    await stakingContract
      .connect(accounts[2])
      .stake(ethers.utils.parseEther("3"), accounts[3].address);

    const amount = await stakingContract.stakerAmounts(
      accounts[2].address,
      accounts[1].address
    );

    const amount2 = await stakingContract.stakerAmounts(
      accounts[3].address,
      accounts[1].address
    );

    const amount3 = await stakingContract.stakerAmounts(
      accounts[3].address,
      accounts[2].address
    );

    expect(amount).to.be.equal(ethers.utils.parseEther("1"));
    expect(amount2).to.be.equal(ethers.utils.parseEther("2"));
    expect(amount3).to.be.equal(ethers.utils.parseEther("3"));
  });

  it("should be able to stake twice in same player", async () => {
    // NOTE: considering the previous test we just have to stake again once in
    // the same player
    await stakingContract
      .connect(accounts[1])
      .stake(ethers.utils.parseEther("1"), accounts[2].address);

    const amount = await stakingContract.stakerAmounts(
      accounts[2].address,
      accounts[1].address
    );

    expect(amount).to.be.equal(ethers.utils.parseEther("2"));
  });

  it("should allow wallets to unstake", async () => {
    await stakingContract
      .connect(accounts[1])
      .unstake(ethers.utils.parseEther("1"), accounts[2].address);

    const amount = await stakingContract.stakerAmounts(
      accounts[2].address,
      accounts[1].address
    );

    await stakingContract
      .connect(accounts[2])
      .unstake(ethers.utils.parseEther("1"), accounts[3].address);

    const amount2 = await stakingContract.stakerAmounts(
      accounts[3].address,
      accounts[2].address
    );

    expect(amount).to.be.equal(ethers.utils.parseEther("1"));
    expect(amount2).to.be.equal(ethers.utils.parseEther("2"));
  });

  it("should not allow to unstake from a player that you don't have any stake", async () => {
    await expect(
      stakingContract
        .connect(accounts[1])
        .unstake(ethers.utils.parseEther("1"), accounts[5].address)
    ).to.be.revertedWith("You are not staking into this player address");
  });

  it("should not be able to unstake with a amount exceding the staked amount", async () => {
    await expect(
      stakingContract
        .connect(accounts[1])
        .unstake(ethers.utils.parseEther("100"), accounts[2].address)
    ).to.be.rejectedWith("Not enough staked amount into the player");
  });

  it("should be able to unstake all the tokens staked on a player", async () => {
    await stakingContract
      .connect(accounts[1])
      .unstake(ethers.utils.parseEther("1"), accounts[2].address);

    const stakeTimeStamp = await stakingContract.stakerTimestamps(
      accounts[2].address,
      accounts[1].address
    );

    expect(stakeTimeStamp.toNumber()).to.be.equal(0);
  });

  it("should not allow wallets to claim if 24 hours haven't passed yet", async () => {
    await expect(stakingContract.connect(accounts[2]).claim()).to.be.rejected;
  });

  it("should allow wallets to claim", async () => {
    const DAY_IN_SECONDS = 24 * 60 * 60;
    const waitTime = (await time.latest()) + DAY_IN_SECONDS;
    await time.increaseTo(waitTime);

    await stakingContract.connect(accounts[1]).claim();

    const balance = await eq9.balanceOf(accounts[1].address);

    expect(balance).to.be.equal(ethers.utils.parseEther("98"));
  });

  it("should be able to revert stakes given a staker and a player", async () => {
    const staker = accounts[1];
    const player = accounts[2];

    await stakingContract
      .connect(staker)
      .stake(ethers.utils.parseEther("2"), player.address);

    await stakingContract.revertStakesFromAPlayer(
      staker.address,
      player.address
    );

    const amount = await stakingContract.stakerAmounts(
      player.address,
      staker.address
    );

    expect(amount).to.be.equal(ethers.utils.parseEther("0"));
  });

  it("should not be able to revert stakes if the given staker and player does not have any", async () => {
    const staker = accounts[1];
    const player = accounts[7];

    await expect(
      stakingContract.revertStakesFromAPlayer(staker.address, player.address)
    ).to.be.rejected;
  });

  it("should be able to pause set pause true", async () => {
    await stakingContract.pause();
  });

  it("should be able to pause set pause false", async () => {
    await stakingContract.unpause();
  });
});
