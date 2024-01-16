import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Condominium", function () {
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

    it("Should NOT remove resident(permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      const instance = contract.connect(resident);      
      await expect(instance.removeResident(resident.address)).to.revertedWith("Only manager is authorized");
    });
    
    it("Should NOT remove resident(is councelor)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.addResident(resident.address, 2102);
      await contract.setCouncelor(resident.address, true);      
      await expect(contract.removeResident(resident.address)).to.revertedWith("A councelor cannot be removed");
    });
    
    it("Should NOT add resident(residence does not exists)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);      
      await expect(contract.addResident(resident.address, 1)).to.revertedWith("This residence does not exists");
    });

    it("Should NOT add resident(permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      const instance = contract.connect(resident);
      await expect(instance.addResident(resident.address, 1)).to.revertedWith("Only manager or council is authorized");
    });

    it("Should set manager", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      await contract.setManager(resident.address);      
      expect(await contract.manager()).to.be.equal(resident.address);
    });

    it("Should NOT set manager(permission)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);
      const instance = contract.connect(resident);
      await expect(instance.setManager(resident.address)).to.revertedWith("Only manager is authorized");
    });

    it("Should NOT set manager(address)", async function () {
      const { contract, manager, resident } = await loadFixture(deployFixture);      
      await expect(contract.setManager(ethers.ZeroAddress)).to.revertedWith("The address must be valid");
    });


  });

});
