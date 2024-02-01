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

  enum Category {
    DECISION = 0,
    SPENT = 1,
    CHANGE_QUOTA = 2,
    CHANGE_MANAGER = 3
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

    it("Should add resident", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);
      await adapter.addResident(accounts[1].address, 1301);      
      expect(await contract.isResident(accounts[1].address)).to.equal(true);
    });

    it("Should remove resident", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);
      await adapter.addResident(accounts[1].address, 1301);
      await adapter.removeResident(accounts[1].address);

      expect(await contract.isResident(accounts[1].address)).to.equal(false);
    });

    it("Should set councelor", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);
      await adapter.addResident(accounts[1].address, 1301);
      await adapter.setCouncelor(accounts[1].address, true);
      expect(await contract.counselors(accounts[1].address)).to.equal(true);
    });

    it("Should add topic", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);
      await adapter.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);      
      expect(await contract.topicExists("topic 1")).to.equal(true);
    });

    


  });

});
