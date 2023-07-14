export function hasChance(percentage: number) {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100 (inclusive).");
  }

  const randomNum = Math.random(); // Generate a random number between 0 and 1
  const threshold = percentage / 100; // Calculate the threshold value based on the percentage

  return randomNum < threshold; // Return true if the random number is less than the threshold
}
