import { Badge } from "@chakra-ui/react";

import Section from "./Section";
import { itemData, typeColorMap } from "../data";
import { InventoryItem, Inventory } from "../systems/inventory";

interface InventoryPanelProps {
  inv: Inventory;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inv }) => {
  return (
    <Section title="Inventory">
      <div className="flex flex-row justify-center space-x-10 p-4 m-4">
        {inv.items.map(({ id, amt }: InventoryItem) => (
          <div key={id}>
            <img
              className="rounded-xl"
              width={100}
              src={itemData[id].image}
              alt={itemData[id].name}
            />

            <p>
              {itemData[id].name}{" "}
              {amt > 1 && <span className="italic">(x{amt})</span>}
            </p>
            <Badge colorScheme={typeColorMap[itemData[id].type]}>
              {itemData[id].type}
            </Badge>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default InventoryPanel;
