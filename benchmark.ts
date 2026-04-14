import { getUniqueSupporterCount, getAverageDonation, getTopSupporters, getSupportersOverTime, getTotalEarnings } from "./lib/analytics";

const mockMemos = Array.from({ length: 10000 }).map((_, i) => ({
  from: `0x${(i % 100).toString(16).padStart(40, '0')}`,
  timestamp: BigInt(Date.now() / 1000 - i * 1000),
  name: `User${i}`,
  message: "Test",
  amount: 1000000000000000000n, // 1 ETH
}));

console.time("getUniqueSupporterCount");
getUniqueSupporterCount(mockMemos as any);
console.timeEnd("getUniqueSupporterCount");

console.time("getAverageDonation");
getAverageDonation(mockMemos as any);
console.timeEnd("getAverageDonation");

console.time("getTopSupporters");
getTopSupporters(mockMemos as any);
console.timeEnd("getTopSupporters");

console.time("getSupportersOverTime");
getSupportersOverTime(mockMemos as any);
console.timeEnd("getSupportersOverTime");

console.time("getTotalEarnings");
getTotalEarnings(mockMemos as any);
console.timeEnd("getTotalEarnings");
