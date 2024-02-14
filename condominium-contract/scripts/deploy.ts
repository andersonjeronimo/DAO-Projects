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
-----NEW (12Fev2024)
Contract deployed to: 0xfdb83651687468132dc906d9F935D41Ce42eb60E
Contract Adapter deployed to: 0x815D76923b60757c75C3881308cd2087d3949683
Contract Adapter upgraded to: 0xfdb83651687468132dc906d9F935D41Ce42eb60E

For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
Successfully submitted source code for contract
contracts/CondominiumAdapter.sol:CondominiumAdapter at 0x815D76923b60757c75C3881308cd2087d3949683
for verification on the block explorer. Waiting for verification result...

Successfully verified contract CondominiumAdapter on the block explorer.
https://testnet.bscscan.com/address/0x815D76923b60757c75C3881308cd2087d3949683#code

 */
