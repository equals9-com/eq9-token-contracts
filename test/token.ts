import { ethers } from "hardhat";
import { Equals9UtilityAndStaking } from "../types";
import { expect } from "chai";

const decimals = "000000000000000000";
describe("Equals9UtilityAndStaking", function () {
  let eq9: Equals9UtilityAndStaking;

  it("Should deploy the eq9 token", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const Equals9UtilityAndStaking = await ethers.getContractFactory(
      "Equals9UtilityAndStaking"
    );
    eq9 = await Equals9UtilityAndStaking.deploy();
    const totalToken = await eq9.balanceOf(owner.address);
    console.log(totalToken.toString());
    await eq9.deployed();
  });

  it("should be able transfer erc20 from addresses", async () => {
    const [owner, other] = await ethers.getSigners();
    await eq9.connect(owner).transfer(other.address, "10");
    const balance = await eq9.balanceOf(other.address);
    expect(balance.toString()).to.be.equal("10");
  });

  it("should decrease the total supply on stake", async () => {
    const totalSupplyBefore = (await eq9.totalSupply()).toString();
    console.log("supply before", totalSupplyBefore);

    await eq9.stake("1700000000" + decimals);
    const totalSupplyAfter = (await eq9.totalSupply()).toString();
    console.log("supply after", totalSupplyAfter);
  });

  it("should increase the total supply on unstake", async () => {
    const totalSupplyBefore = (await eq9.totalSupply()).toString();
    console.log("supply before", totalSupplyBefore);

    await eq9.unstake("1700000000" + decimals);
    const totalSupplyAfter = (await eq9.totalSupply()).toString();
    console.log("supply after", totalSupplyAfter);
  });

  it("should not increase the staking amount if staker already has stake (only new stakers should be counted)", async () => {
    const totalSupplyBefore = (await eq9.totalSupply()).toString();
    console.log("supply before", totalSupplyBefore);

    await eq9.stake("1000");

    await eq9.stake("100000");
    const amountStakes = (await eq9.amountStakes()).toString();
    console.log("amount of stakers after", amountStakes);
  });

  it("should set to 0 the stakes", async () => {
    const [owner] = await ethers.getSigners();
    const stake = await eq9.stakers(owner.address);
    const stringStake = stake.toString();
    console.log(stringStake);
    await eq9.unstake(stringStake);

    console.log("amount stakes should be 0");
    const amountStakes = (await eq9.amountStakes()).toString();
    console.log(amountStakes);
  });

  it("should set 2 to the the stakes", async () => {
    const [owner, other] = await ethers.getSigners();
    await eq9.connect(owner).stake("10");
    await eq9.connect(other).stake("10");

    console.log("amount stakes should be 2");
    const amountStakes = (await eq9.amountStakes()).toString();
    console.log(amountStakes);
  });

  it("should not allow to unstake more than the staked value", async () => {
    const [, other] = await ethers.getSigners();

    await expect(eq9.connect(other).unstake("11")).to.be.revertedWith("");
  });

  it("should be able to use public and external functions from ERC20 interface ", async () => {
    const instance = await ethers.getContractAt("IEQ9", eq9.address);
    const totalSupply = await instance.totalSupply();
    console.log("total supply", totalSupply.toString());
  });
});
