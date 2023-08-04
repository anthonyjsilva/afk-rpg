import { Button } from "@chakra-ui/react";
import Section from "./Section";
import { itemData } from "../data";
import { Inventory } from "../systems/inventory";
import { canCraftItem, craftItem, craftingRecipes } from "../systems/crafting";

interface CraftingPanelProps {
  inv: Inventory;
}

const statusColors = {
  complete: "text-green-500",
  partial: "text-orange-500",
  none: "text-red-500",
};

const CraftingPanel: React.FC<CraftingPanelProps> = ({ inv }) => {
  const getItemColor = (requiredItem: string, requiredAmount: number) => {
    const currentAmt = inv.getItemAmount(requiredItem);

    if (currentAmt >= requiredAmount) {
      return statusColors.complete;
    } else if (currentAmt > 1) {
      return statusColors.partial;
    }
    return statusColors.none;
  };

  return (
    <Section title="Crafting">
      <div className="flex flex-wrap justify-start align-top">
        {Object.keys(craftingRecipes).map((itemName) => {
          const recipe = craftingRecipes[itemName];
          const canCraft = canCraftItem(recipe, inv);

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
                onClick={() => craftItem(itemName, recipe, inv)}
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
