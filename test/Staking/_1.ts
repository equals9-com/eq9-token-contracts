import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { EQ9 } from "../../types";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Tournament with a ERC20 token as subscription", function () {
  let eq9: EQ9;
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

  it("should allow wallets to stake", async () => {});

  it("should allow wallets to unstake", async () => {});

  it("should allow wallets to claim", async () => {});

  it("should not allow wallets to claim if 24 hours haven't passed yer", async () => {});
});
