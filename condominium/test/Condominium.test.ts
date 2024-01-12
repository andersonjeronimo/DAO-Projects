import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Condominium", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Condominium = await ethers.getContractFactory("Condominium");
    const condominium = await Condominium.deploy();

    return { condominium, owner, otherAccount };
  }

  describe("Condominium tests", function () {

    it("Should get message from the contract", async function () {
      const { condominium, owner, otherAccount } = await loadFixture(deployFixture);
      expect(await condominium.message()).to.equal("Hello World");
    });

    it("Should set message from the contract", async function () {
      const { condominium, owner, otherAccount } = await loadFixture(deployFixture);
      await condominium.setMessage("New Message");
      expect(await condominium.message()).to.equal("New Message");
    });

    it("Should NOT set message from the contract (permission)", async function () {
      const { condominium, owner, otherAccount } = await loadFixture(deployFixture);
      const instance = condominium.connect(otherAccount);      
      await expect(instance.setMessage("Any Message")).to.be.revertedWith("You do not have permission");
    });



  });

});
