import { Inventory, itemData } from "../data";

export const craftingRecipes: Record<string, Record<string, number>> = {
  pickaxe: {
    metal: 1,
    wood: 1,
  },
  axe: {
    metal: 50,
    wood: 20,
  },
  chest: {
    wood: 100,
    metal: 100,
  },
  sword: {
    metal: 50,
    wood: 50,
  },
};

// Function to check if an item can be crafted based on the current inventory
export const canCraftItem = (
  recipe: Record<string, number>,
  inventory: Inventory
): boolean => {
  for (const requiredItem in recipe) {
    if (
      !inventory.hasItem(requiredItem) ||
      inventory.getItemAmount(requiredItem) < recipe[requiredItem]
    ) {
      return false;
    }
  }
  return true;
};

// Function to craft an item by consuming the required items from the inventory
export const craftItem = (
  itemName: string,
  recipe: Record<string, number>,
  inventory: Inventory
): void => {
  if (canCraftItem(recipe, inventory)) {
    for (const requiredItem in recipe) {
      inventory.remove(requiredItem, recipe[requiredItem]);
    }
    inventory.add(itemName);
    console.log(`Crafted ${itemData[itemName].name}`);
  } else {
    console.log(`Insufficient resources to craft ${itemData[itemName].name}`);
  }
};
