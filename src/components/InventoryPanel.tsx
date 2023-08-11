import { useGameState } from "../GameStateContext";
import Section from "./Section";
import { Inventory } from "../systems/inventory";
import ItemsList from "./ItemsList";

interface InventoryPanelProps {
  inv: Inventory;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inv }) => {
  const { state } = useGameState();

  return (
    <Section title="Inventory">
      <div>Currency:</div>
      <div>{state.gold} gold</div>

      <div>Capacity:</div>
      <div>{inv.items.length} / 20</div>

      <ItemsList items={inv.items} />
    </Section>
  );
};

export default InventoryPanel;
