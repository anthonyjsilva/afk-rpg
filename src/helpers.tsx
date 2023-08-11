export function hasChance(percentage: number) {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100 (inclusive).");
  }

  const randomNum = Math.random(); // Generate a random number between 0 and 1
  const threshold = percentage / 100; // Calculate the threshold value based on the percentage

  return randomNum < threshold; // Return true if the random number is less than the threshold
}

// Define the base XP required for level 1 and the exponent for XP growth
const BASE_XP = 100;
const XP_EXPONENT = 1.5;

// Function to calculate the XP required for a given level
export const calculateXPRequired = (level) => {
  return Math.round(BASE_XP * level ** XP_EXPONENT);
};

export const calculatePercentage = (current, max) => {
  return Math.round((current / max) * 100);
};
