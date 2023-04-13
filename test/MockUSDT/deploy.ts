import { ethers } from "hardhat";
import { expect } from "chai";
import { MockUSDT } from "../../types";

describe("MockUSDT", function () {
  let usdt: MockUSDT;

  it("Should deploy MockUSDT token and it should have 6 decimals", async function () {
    const [owner] = await ethers.getSigners();

    // We get the contract to deploy
    const MockUsdtInstance = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUsdtInstance.deploy();
    await usdt.balanceOf(owner.address);

    await usdt.deployed();

    expect(await usdt.decimals()).to.be.equal(6);
  });
});
