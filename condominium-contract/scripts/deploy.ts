import { ethers } from "hardhat";

async function main() {
  const Condominium = await ethers.getContractFactory("Condominium");
  const contract = await Condominium.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Contract deployed to: ${contractAddress}`);

  /* const CondominiumAdapter = await ethers.getContractFactory("CondominiumAdapter");
  const adapter = await CondominiumAdapter.deploy();

  await adapter.waitForDeployment();
  const adapterAddress = await adapter.getAddress();
  console.log(`Contract Adapter deployed to: ${adapterAddress}`);

  await adapter.upgrade(contractAddress);
  console.log(`Contract Adapter upgraded to: ${contractAddress}`); */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * 
 * --NEW CONTRACT DEPLOY (23/04/2024)
 * Contract deployed to: 0x3C8AE1Cd9bf124ce57C7e1f9F33A0DC68f8da2F0
 * Contract Adapter upgraded to: 0x3C8AE1Cd9bf124ce57C7e1f9F33A0DC68f8da2F0 (via testnet.bdcscan)
-----NEW DEPLOY (18Fev2024)
Contract Adapter deployed to: 0x6aC9439e284dbeAb24a8cEd5dcB216004f3C39b9
Contract Adapter upgraded to: 0x5C056a2900706C7053d9bb677259f6BcD22aCD4F

-----NEW VERIFY (18Fev2024)
For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
Successfully submitted source code for contract
contracts/CondominiumAdapter.sol:CondominiumAdapter at 0x6aC9439e284dbeAb24a8cEd5dcB216004f3C39b9
for verification on the block explorer. Waiting for verification result...

Successfully verified contract CondominiumAdapter on the block explorer.
https://testnet.bscscan.com/address/0x6aC9439e284dbeAb24a8cEd5dcB216004f3C39b9#code

 */
