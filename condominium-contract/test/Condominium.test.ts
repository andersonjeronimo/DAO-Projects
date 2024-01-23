import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Condominium", function () {
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
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [manager, resident] = await ethers.getSigners();

    const Condominium = await ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, resident };
  }

  describe("Condominium tests", function () {

    it("Should be residence", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      expect(await contract.residenceExists(1101)).to.equal(true);
    });

    it("Should add resident", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      expect(await contract.isResident(resident.address)).to.equal(true);
    });

    it("Should remove resident", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.removeResident(resident.address);
      expect(await contract.isResident(resident)).to.be.equal(false);
    });

    it("Should NOT remove resident (permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      const instance = contract.connect(resident);
      await expect(instance.removeResident(resident.address)).to.revertedWith("Only manager is authorized");
    });

    it("Should NOT remove resident (is councelor)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.setCouncelor(resident.address, true);
      await expect(contract.removeResident(resident.address)).to.revertedWith("A councelor cannot be removed");
    });

    it("Should NOT add resident (residence does not exists)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await expect(contract.addResident(resident.address, 1)).to.revertedWith("This residence does not exists");
    });

    it("Should NOT add resident (permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      const instance = contract.connect(resident);
      await expect(instance.addResident(resident.address, 1)).to.revertedWith("Only manager or council is authorized");
    });

    it("Should set manager", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.setManager(resident.address);
      expect(await contract.manager()).to.be.equal(resident.address);
    });

    it("Should NOT set manager (permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      const instance = contract.connect(resident);
      await expect(instance.setManager(resident.address)).to.revertedWith("Only manager is authorized");
    });

    it("Should NOT set manager (address)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await expect(contract.setManager(ethers.ZeroAddress)).to.revertedWith("The address must be valid");
    });

    it("Should add topic", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addTopic("topic 1", "lorem ipsum");
      expect(await contract.topicExists("topic 1")).to.equal(true);
    });

    it("Should NOT remove topic (status)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");
      await expect(contract.removeTopic("topic 1")).to.revertedWith("Only IDLE topics can be removed");
    });

    it("Should vote", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");

      const instance = contract.connect(resident);
      await instance.vote("topic 1", Options.YES);

      expect(await instance.numberOfVotes("topic 1")).to.be.equal(1);
    });

    it("Should NOT vote (duplicated)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");

      const instance = contract.connect(resident);
      await instance.vote("topic 1", Options.YES);

      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("A residence should vote only once");
    });

    it("Should NOT vote (status)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      //await contract.openVoting("topic 1");
      const instance = contract.connect(resident);
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("Only VOTING topics can be voted");
    });

    it("Should NOT vote (topic does not exists)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      //await contract.addTopic("topic 1", "lorem ipsum");
      //await contract.openVoting("topic 1");
      const instance = contract.connect(resident);
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("The topic does not exists");
    });

    it("Should NOT vote (permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      //await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");

      const instance = contract.connect(resident);
      await expect(instance.vote("topic 1", Options.YES)).to.revertedWith("Only manager or resident is authorized");
    });

    it("Should NOT vote (empty)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");

      const instance = contract.connect(resident);
      await expect(instance.vote("topic 1", Options.EMPTY)).to.revertedWith("The option can not be EMPTY");
    });

    it("Should close voting", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.addTopic("topic 1", "lorem ipsum");
      await contract.openVoting("topic 1");
      await contract.vote("topic 1", Options.YES);
      const instance = contract.connect(resident);
      await instance.vote("topic 1", Options.YES);
      await contract.closeVoting("topic 1");

      const topic = await contract.getTopic("topic 1");

      expect(topic.status).to.be.equal(Status.APPROVED);
    });

  });

});
