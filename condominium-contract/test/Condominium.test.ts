import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Condominium } from "../typechain-types";

describe("Condominium", function () {
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
    SPENT = 4
  }

  //2 bl 5 and 4 apt
  const residences = [1101, 1102, 1103, 1104, 1201, 1202, 1203, 1204, 1301, 1302, 1303, 1304,
    1401, 1402, 1403, 1404, 1501, 1502, 1503, 1504];

  async function deployFixture() {
    const accounts = await ethers.getSigners();
    const manager = accounts[0];

    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, accounts };
  }

  describe("Condominium tests", function () {

    it("Should be residence", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      expect(await contract.residenceExists(1101)).to.equal(true);
    });

    it("Should add accounts", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      expect(await contract.isResident(accounts[1].address)).to.equal(true);
    });

    it("Should remove accounts", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.removeResident(accounts[1].address);
      expect(await contract.isResident(accounts[1])).to.be.equal(false);
    });

    it("Should NOT remove accounts (permission)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      const instance = contract.connect(accounts[1]);
      await expect(instance.removeResident(accounts[1].address)).to.revertedWith("Only manager is authorized");
    });

    it("Should NOT remove accounts (is councelor)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.setCouncelor(accounts[1].address, true);
      await expect(contract.removeResident(accounts[1].address)).to.revertedWith("A councelor cannot be removed");
    });

    it("Should NOT add accounts (residence does not exists)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await expect(contract.addResident(accounts[1].address, 1)).to.revertedWith("This residence does not exists");
    });

    it("Should NOT add accounts (permission)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      const instance = contract.connect(accounts[1]);
      await expect(instance.addResident(accounts[1].address, 1)).to.revertedWith("Only manager or council is authorized");
    });

    it("Should set manager", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      for (let index = 0; index < 16; index++) {
        await contract.addResident(accounts[index + 1].address, residences[index]);
      }
      await contract.addTopic("change manager", "lorem ipsum", Category.CHANGE_MANAGER, 0, accounts[1]);
      await contract.openVoting("change manager");
      let instance: Condominium;
      for (let index = 0; index < 16; index++) {
        instance = contract.connect(accounts[index + 1]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("change manager", Options.YES);
      }
      await contract.closeVoting("change manager");
      expect(await contract.manager()).to.be.equal(accounts[1].address);
    });

    it("Should change quota", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      for (let index = 0; index < 20; index++) {
        await contract.addResident(accounts[index].address, residences[index]);
      }
      const value = ethers.parseEther("0.02");
      await contract.addTopic("change quota", "lorem ipsum", Category.CHANGE_QUOTA, value, manager);
      await contract.openVoting("change quota");
      let instance: Condominium;
      for (let index = 0; index < 20; index++) {
        instance = contract.connect(accounts[index]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("change quota", Options.YES);
      }
      await contract.closeVoting("change quota");
      expect(await contract.monthlyQuota()).to.be.equal(value);
    });

    it("Should add topic", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      expect(await contract.topicExists("topic 1")).to.equal(true);
    });

    it("Should NOT remove topic (status)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");
      await expect(contract.removeTopic("topic 1")).to.revertedWith("Only IDLE topics can be removed");
    });

    it("Should vote", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");

      const instance = contract.connect(accounts[1]);
      await instance.payQuota(2102, { value: ethers.parseEther("0.01") });
      await instance.vote("topic 1", Options.YES);

      expect(await instance.numberOfVotes("topic 1")).to.be.equal(1);
    });

    it("Should NOT vote (duplicated)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");

      const instance = contract.connect(accounts[1]);
      await instance.payQuota(2102, { value: ethers.parseEther("0.01") });
      await instance.vote("topic 1", Options.YES);

      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("A residence should vote only once");
    });

    it("Should NOT vote (status)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      //await contract.openVoting("topic 1");
      const instance = contract.connect(accounts[1]);
      await instance.payQuota(2102, { value: ethers.parseEther("0.01") });
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("Only VOTING topics can be voted");
    });

    it("Should NOT vote (topic does not exists)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      //await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      //await contract.openVoting("topic 1");
      const instance = contract.connect(accounts[1]);
      await instance.payQuota(2102, { value: ethers.parseEther("0.01") });
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("The topic does not exists");
    });

    it("Should NOT vote (permission)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      //await contract.addResident(accounts.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");

      const instance = contract.connect(accounts[1]);
      //await instance.payQuota(2102, {value:ethers.parseEther("0.01")});
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("Only manager or resident is authorized");
    });

    it("Should NOT vote (empty)", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);
      await contract.addResident(accounts[1].address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");

      const instance = contract.connect(accounts[1]);
      await instance.payQuota(2102, { value: ethers.parseEther("0.01") });
      await expect(instance.vote("topic 1", Options.EMPTY)).to.revertedWith("The option can not be EMPTY");
    });

    it("Should close voting", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);

      for (let index = 0; index < 5; index++) {
        await contract.addResident(accounts[index + 1].address, residences[index]);
      }

      await contract.addTopic("topic 1", "lorem ipsum", Category.DECISION, 0, manager);
      await contract.openVoting("topic 1");

      let instance: Condominium;
      for (let index = 0; index < 5; index++) {
        instance = contract.connect(accounts[index + 1]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("topic 1", Options.YES);
      }

      await contract.closeVoting("topic 1");
      const topic = await contract.getTopic("topic 1");
      expect(topic.status).to.be.equal(Status.APPROVED);
    });

    it("Should transfer", async function () {
      const { contract, manager, accounts } = await loadFixture(deployFixture);

      for (let index = 0; index < 10; index++) {
        await contract.addResident(accounts[index].address, residences[index]);
      }

      await contract.addTopic("some spent topic", "buy stuff", Category.SPENT, 100, accounts[1].address);
      await contract.openVoting("some spent topic");

      let instance: Condominium;
      for (let index = 0; index < 10; index++) {
        instance = contract.connect(accounts[index]);
        await instance.payQuota(residences[index], { value: ethers.parseEther("0.01") });
        await instance.vote("some spent topic", Options.YES);
      }

      await contract.closeVoting("some spent topic");

      const balanceBefore = await ethers.provider.getBalance(contract.getAddress());
      const workerBalanceBefore = await ethers.provider.getBalance(accounts[1].address);
      
      await contract.transfer("some spent topic", 100);
      
      const balanceAfter = await ethers.provider.getBalance(contract.getAddress());
      const workerBalanceAfter = await ethers.provider.getBalance(accounts[1].address);

      const topic = await contract.getTopic("some spent topic");
      
      expect(balanceAfter).to.be.equal(balanceBefore - 100n);
      expect(workerBalanceAfter).to.be.equal(workerBalanceBefore + 100n);
      expect(topic.status).to.be.equal(Status.SPENT);
    });





  });

});
