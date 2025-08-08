const hre = require("hardhat");

async function main () {
  const Vault = await hre.ethers.getContractFactory("MoStarPayoutVault");
  const vault = await Vault.deploy({ value: 0 });
  await vault.deployed();
  console.log("VAULT_ADDRESS:", vault.address);
}

main().catch(err => { console.error(err); process.exitCode = 1; });
