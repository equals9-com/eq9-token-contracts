import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { EQ9, Staking } from "../../types";

const getUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

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

    expect(amount).to.be.equal(ethers.utils.parseEther("0"));
    expect(amount2).to.be.equal(ethers.utils.parseEther("2"));
  });

  it("should not allow wallets to claim if 24 hours haven't passed yet", async () => {
    await expect(stakingContract.connect(accounts[2]).claim()).to.be.rejected;
  });

  // NOTE: after this test the mined blocks are mined after 1 day
  it("should allow wallets to claim", async () => {
    // pega o dia atual e adiciona 1 dia

    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);

    await stakingContract.connect(accounts[1]).claim();

    const balance = await eq9.balanceOf(accounts[1].address);

    expect(balance).to.be.equal(ethers.utils.parseEther("98"));
  });
});
