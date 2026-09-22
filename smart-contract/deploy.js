/**
 * Hardhat deployment script for TrustChain smart contract
 * Run with: npx hardhat run deploy.js --network sepolia (or localhost)
 */
const hre = require("hardhat");

async function main() {
  console.log("Deploying TrustChain Smart Contract...");

  const TrustChain = await hre.ethers.getContractFactory("TrustChain");
  const trustChain = await TrustChain.deploy();
  await trustChain.waitForDeployment();

  const address = await trustChain.getAddress();
  console.log(`TrustChain deployed successfully at address: ${address}`);
  console.log(`Copy this address to your CONTRACT_ADDRESS in .env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
