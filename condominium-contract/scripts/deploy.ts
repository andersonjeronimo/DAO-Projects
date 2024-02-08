import { ethers } from "hardhat";

async function main() {
  const Condominium = await ethers.getContractFactory("Condominium");
  const contract = await Condominium.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Contract deployed to: ${contractAddress}`);

  const CondominiumAdapter = await ethers.getContractFactory("CondominiumAdapter");
  const adapter = await CondominiumAdapter.deploy();

  await adapter.waitForDeployment();
  const adapterAddress = await adapter.getAddress();
  console.log(`Contract Adapter deployed to: ${adapterAddress}`);

  await adapter.upgrade(contractAddress);
  console.log(`Contract Adapter upgraded to: ${contractAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
Contract deployed to: 0x023d63d3cE6A58d470e6977759c1220B827e6EAc
Contract Adapter deployed to: 0x19f6236ca35CFE5e928e12e92e153FA014e079A7
Contract Adapter upgraded to: 0x023d63d3cE6A58d470e6977759c1220B827e6EAc

Successfully verified contract CondominiumAdapter on the block explorer.
https://testnet.bscscan.com/address/0x19f6236ca35CFE5e928e12e92e153FA014e079A7#code

 */
