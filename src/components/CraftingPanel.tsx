import { Button } from "@chakra-ui/react";
import Section from "./Section";

import { useGameState } from "../GameStateContext";

import { itemData } from "../data";
import { Inventory } from "../systems/inventory";

export const craftingRecipes: Record<string, Record<string, number>> = {
  pickaxe: {
    metal: 5,
    wood: 5,
  },
  axe: {
    metal: 5,
    wood: 5,
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

const statusColors = {
  complete: "text-green-500",
  partial: "text-orange-500",
  none: "text-red-500",
};

const CraftingPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const addMessage = (message: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  };
  const getItemColor = (requiredItem: string, requiredAmount: number) => {
    const currentAmt = state.inv.getItemAmount(requiredItem);

    if (currentAmt >= requiredAmount) {
      return statusColors.complete;
    } else if (currentAmt > 1) {
      return statusColors.partial;
    }
    return statusColors.none;
  };

  // Updated craftItem function to use dispatch and update the game state
  const craftItem = (
    itemName: string,
    recipe: Record<string, number>,
    inventory: Inventory
  ): void => {
    if (canCraftItem(recipe, inventory)) {
      for (const requiredItem in recipe) {
        inventory.remove(requiredItem, recipe[requiredItem]);
      }
      inventory.add(itemName);
      addMessage(`Crafted ${itemData[itemName].name}`);

      // Dispatch an action to update the game state with the new inventory
      dispatch({ type: "UPDATE_INVENTORY", payload: inventory.items });
    } else {
      addMessage(`Insufficient resources to craft ${itemData[itemName].name}`);
    }
  };

  return (
    <Section title="Crafting">
      <div className="flex flex-wrap justify-start align-top">
        {Object.keys(craftingRecipes).map((itemName) => {
          const recipe = craftingRecipes[itemName];
          const canCraft = canCraftItem(recipe, state.inv);

          return (
            <div
              key={itemName}
              className="p-2 m-2 flex flex-col flex-grow justify-start items-center border rounded border-stone-500"
            >
              <div className="flex">
                <img
                  src={itemData[itemName].image}
                  alt={itemData[itemName].name}
                  className="w-6 h-6 mr-2"
                />
                <h3>{itemData[itemName].name}</h3>
              </div>

              <div>
                {Object.entries(recipe).map(
                  ([requiredItem, requiredAmount]) => {
                    const colorClass = getItemColor(
                      requiredItem,
                      requiredAmount
                    );
                    return (
                      <p
                        key={requiredItem}
                        // style={{
                        //   color: getItemColor(requiredItem, requiredAmount),
                        // }}
                        className={colorClass}
                      >
                        {requiredAmount} {itemData[requiredItem].name}
                      </p>
                    );
                  }
                )}
              </div>

              <Button
                isDisabled={!canCraft}
                colorScheme={canCraft ? "green" : "gray"}
                onClick={() => craftItem(itemName, recipe, state.inv)}
              >
                Craft
              </Button>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default CraftingPanel;
