import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { EQ9, Staking } from "../../types";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Staking contract test for reading contract information", function () {
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
    for (let i = 1; i < accounts.length; i++) {
      await stakingContract
        .connect(accounts[i])
        .stake(ethers.utils.parseEther("1"), accounts[2].address);

      const amount = await stakingContract.stakerAmounts(
        accounts[2].address,
        accounts[i].address
      );

      expect(amount).to.be.equal(ethers.utils.parseEther("1"));
    }
  });

  it("should be possible to fetch all stakes into a player", async () => {
    const length = await stakingContract.fetchStakersAmount(
      accounts[2].address
    );

    const stakes = await stakingContract.fetchPlayerStakes(
      accounts[2].address,
      "0",
      length
    );

    // NOTE: the values of this array changes everytime, so its very difficult to
    // precisely expect all the values
    expect(stakes).to.exist;
    expect(length.toNumber()).to.be.equal(19);
  });
});
