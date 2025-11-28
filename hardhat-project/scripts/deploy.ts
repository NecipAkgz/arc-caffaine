import hre from "hardhat";

async function main() {
  const ArcCaffeine = await hre.ethers.getContractFactory("ArcCaffeine");
  const arcCaffeine = await ArcCaffeine.deploy();

  await arcCaffeine.waitForDeployment();

  console.log("ArcCaffeine deployed to:", await arcCaffeine.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
