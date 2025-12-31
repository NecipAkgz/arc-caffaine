import hre from "hardhat";

async function main() {
  const ARC_CAFFEINE_ADDRESS = "0xcC7F8BD425265EA2619B0876B76487B824D57c2d";

  console.log("Deploying CreatorSupporterBadge contract...");
  console.log("ArcCaffeine address:", ARC_CAFFEINE_ADDRESS);

  const CreatorSupporterBadge = await hre.ethers.getContractFactory(
    "CreatorSupporterBadge"
  );
  const badge = await CreatorSupporterBadge.deploy(ARC_CAFFEINE_ADDRESS);

  await badge.waitForDeployment();

  const address = await badge.getAddress();
  console.log("");
  console.log("✅ CreatorSupporterBadge deployed to:", address);
  console.log("");
  console.log("Next steps:");
  console.log(
    `1. Update lib/badge-abi.ts with: export const SUPPORTER_BADGE_ADDRESS = "${address}";`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
