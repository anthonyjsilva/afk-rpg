import { Badge, Tooltip } from "@chakra-ui/react";
import { itemData, typeColorMap } from "../data/data";
import { InventoryItem } from "../systems/inventory";

interface InventoryPanelProps {
  items: InventoryItem[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap flex-row justify-start p-4 m-4">
      {items.map(({ id, amt }: InventoryItem) => (
        <div key={id} className="m-1">
          <Tooltip
            label={
              itemData[id].description ? itemData[id].description : "unknown"
            }
            aria-label="A tooltip"
          >
            <img
              className="rounded-xl"
              width={70}
              src={itemData[id].image}
              alt={itemData[id].name}
            />
          </Tooltip>
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
  );
};

export default InventoryPanel;
