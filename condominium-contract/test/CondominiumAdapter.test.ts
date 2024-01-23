import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Condominium Adapter tests", function () {
  enum Options {
    EMPTY = 0,
    YES = 1,
    NO = 2,
    ABSTENTION = 3
  }

  enum Status {
    IDLE = 0,
    VOTING = 1,
    APPROVED = 2,
    DENIED = 3
}
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAdapterFixture() {
    // Contracts are deployed using the first signer/account by default
    const accounts = await ethers.getSigners();
    const manager = accounts[0];
    const CondominiumAdapter = await ethers.getContractFactory("CondominiumAdapter");
    const adapter = await CondominiumAdapter.deploy();
    return { adapter, manager, accounts };
  }

  async function deployImplementationFixture() {
    // Contracts are deployed using the first signer/account by default
    //const accounts = await ethers.getSigners();
    //const manager = accounts[0];
    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();
    return { contract };
  }

  describe("Condominium tests", function () {

    it("Should upgrade", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);
      const adapterAddress = await adapter.getImplementationAddress();
      expect(contractAddress).to.equal(adapterAddress);
    });

    it("Should NOT upgrade (permission)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);        
        const instance = adapter.connect(accounts[1]);//accounts[0] is the manager acc
        const contractAddress = await contract.getAddress();
        await expect(instance.upgrade(contractAddress)).to.revertedWith("You do not have permission");
      });

    

  });

});
