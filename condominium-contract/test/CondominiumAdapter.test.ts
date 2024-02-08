import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CondominiumAdapter } from "../typechain-types";

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
    DENIED = 3,
    DELETED = 4,
    SPENT = 5
  }

  //2 bl 5 and 4 apt
  const residences = [1101, 1102, 1103, 1104, 1201, 1202, 1203, 1204, 1301, 1302, 1303, 1304,
    1401, 1402, 1403, 1404, 1501, 1502, 1503, 1504];

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

    it("Should vote", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);

      await adapter.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await adapter.openVoting("topic 1");
      await adapter.addResident(accounts[1].address, residences[1]);

      const instance = adapter.connect(accounts[1]);
      await instance.payQuota(residences[1], { value: ethers.parseEther("0.01") });
      await instance.vote("topic 1", Options.YES);

      expect(await contract.numberOfVotes("topic 1")).to.be.equal(1);
    });

    it("Should close voting", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);

      for (let index = 0; index < 5; index++) {
        await adapter.addResident(accounts[index + 1].address, residences[index]);
      }

      await adapter.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await adapter.openVoting("topic 1");

      let instance: CondominiumAdapter;
      for (let index = 0; index < 5; index++) {
        instance = adapter.connect(accounts[index + 1]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("topic 1", Options.YES);
      }

      await adapter.closeVoting("topic 1");
      const topic = await contract.getTopic("topic 1");
      expect(topic.status).to.be.equal(Status.APPROVED);
    });

    it("Should transfer", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);

      for (let index = 0; index < 10; index++) {
        await adapter.addResident(accounts[index + 1].address, residences[index]);
      }

      await adapter.addTopic("some spent topic", "buy stuff", Category.SPENT, 100, accounts[1].address);
      await adapter.openVoting("some spent topic");

      let instance: CondominiumAdapter;
      for (let index = 0; index < 10; index++) {
        instance = adapter.connect(accounts[index + 1]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("some spent topic", Options.YES);
      }

      await adapter.closeVoting("some spent topic");

      const balanceBefore = await ethers.provider.getBalance(contract.getAddress());
      const workerBalanceBefore = await ethers.provider.getBalance(accounts[1].address);

      await adapter.transfer("some spent topic", 100);

      const balanceAfter = await ethers.provider.getBalance(contract.getAddress());
      const workerBalanceAfter = await ethers.provider.getBalance(accounts[1].address);

      const topic = await contract.getTopic("some spent topic");

      expect(balanceAfter).to.be.equal(balanceBefore - 100n);
      expect(workerBalanceAfter).to.be.equal(workerBalanceBefore + 100n);
      expect(topic.status).to.be.equal(Status.SPENT);
    });

    it.only("Should emit event (CHANGE MANAGER)", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);

      for (let index = 0; index < 15; index++) {
        await adapter.addResident(accounts[index + 1].address, residences[index]);
      }

      await adapter.addTopic("change manager", "lorem ipsum", Category.CHANGE_MANAGER, 0, accounts[1].address);
      await adapter.openVoting("change manager");

      let instance: CondominiumAdapter;
      for (let index = 0; index < 15; index++) {
        instance = adapter.connect(accounts[index + 1]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("change manager", Options.YES);
      }
      //......................event args
      //event ManagerChanged(address manager);
      await expect(adapter.closeVoting("change manager")).to.emit(adapter, "ManagerChanged").withArgs(accounts[1].address);
      //expect(await contract.getManager()).to.be.equal(accounts[1].address);
    });

    it.only("Should emit event (CHANGE QUOTA)", async function () {
      const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
      const { contract } = await loadFixture(deployImplementationFixture);
      const contractAddress = await contract.getAddress();
      await adapter.upgrade(contractAddress);

      for (let index = 0; index < 20; index++) {
        await adapter.addResident(accounts[index].address, residences[index]);
      }

      await adapter.addTopic("change quota", "lorem ipsum", Category.CHANGE_QUOTA, 100, manager);
      await adapter.openVoting("change quota");

      let instance: CondominiumAdapter;
      for (let index = 0; index < 20; index++) {
        instance = adapter.connect(accounts[index]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("change quota", Options.YES);
      }
      //....................event args
      //event QuotaChanged(uint amount);
      await expect(adapter.closeVoting("change quota")).to.emit(adapter, "QuotaChanged").withArgs(100);
      //expect(await contract.getQuota()).to.be.equal(100);
    });





  });

});
