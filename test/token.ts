import { ethers } from "hardhat";
import { EQ9 } from "../types";
import { expect } from "chai";

const decimals = "000000000000000000";
describe("EQ9", function () {
  let eq9: EQ9;

  it("Should deploy the eq9 token", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const EQ9 = await ethers.getContractFactory("EQ9");
    eq9 = await EQ9.deploy();
    await eq9.balanceOf(owner.address);

    await eq9.deployed();
  });

  it("should be able transfer erc20 from addresses", async () => {
    const [owner, other] = await ethers.getSigners();
    await eq9.connect(owner).transfer(other.address, "10");
    const balance = await eq9.balanceOf(other.address);
    expect(balance.toString()).to.be.equal("10");
  });

  it("should decrease the total supply on stake", async () => {
    (await eq9.totalSupply()).toString();

    await eq9.stake("1700000000" + decimals);
    (await eq9.totalSupply()).toString();
  });

  it("should increase the total supply on unstake", async () => {
    (await eq9.totalSupply()).toString();

    await eq9.unstake("1700000000" + decimals);
    (await eq9.totalSupply()).toString();
  });

  it("should not increase the staking amount if staker already has stake (only new stakers should be counted)", async () => {
    (await eq9.totalSupply()).toString();

    await eq9.stake("1000");

    await eq9.stake("100000");
    (await eq9.amountStakes()).toString();
  });

  it("should set to 0 the stakes", async () => {
    const [owner] = await ethers.getSigners();
    const stake = await eq9.stakers(owner.address);
    const stringStake = stake.toString();

    await eq9.unstake(stringStake);

    (await eq9.amountStakes()).toString();
  });

  it("should set 2 to the the stakes", async () => {
    const [owner, other] = await ethers.getSigners();
    await eq9.connect(owner).stake("10");
    await eq9.connect(other).stake("10");

    (await eq9.amountStakes()).toString();
  });

  it("should not allow to unstake more than the staked value", async () => {
    const [, other] = await ethers.getSigners();

    await expect(eq9.connect(other).unstake("11")).to.be.rejected;
  });

  it("should be able to use public and external functions from ERC20 interface ", async () => {
    const instance = await ethers.getContractAt("IEQ9", eq9.address);
    await instance.totalSupply();
  });
});
