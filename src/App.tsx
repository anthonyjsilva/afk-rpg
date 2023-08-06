import { useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import "../node_modules/rpg-awesome/css/rpg-awesome.min.css";

import { useGameState } from "./GameStateContext";

import {
  ActionPanel,
  CharacterPanel,
  MessagePanel,
  CraftingPanel,
  InventoryPanel,
  MapPanel,
  Section,
  QuestPanel,
} from "./components";
import "./index.css";
import {
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";

dayjs.extend(duration);
dayjs.extend(relativeTime);

function App(): JSX.Element {
  const { state, dispatch } = useGameState();
  const [currentPanel, setCurrentPanel] = useState("inventory");

  const PANELS = {
    CHARACTER: "character",
    INVENTORY: "inventory",
    // CRAFTING: "crafting",
    QUEST: "quest",
  };

  const renderSideBarPanel = () => {
    switch (currentPanel) {
      case PANELS.CHARACTER:
        return <CharacterPanel />;
      case PANELS.INVENTORY:
        return <InventoryPanel inv={state.inv} />;
      // case PANELS.CRAFTING:
      //   return <CraftingPanel />;
      case PANELS.QUEST:
        return <QuestPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="m-10 text-center">
      <h1 className="text-blue-500 text-7xl font-extrabold p-4 mt-10">
        <i className="ra ra-sword"></i>
        {` AFK RPG `}
        <i className="ra ra-castle-flag"></i>
      </h1>

      <div className="grid grid-cols-6 grid-rows-3 h-screen">
        {/* Main Window */}
        <div className="col-span-4 row-span-2">
          <div className="grid grid-cols-2 gap-4">
            <MapPanel />
            <ActionPanel />
            <div className="col-span-4">
              <MessagePanel messages={state.messages} />
            </div>
          </div>
        </div>

        {/* Side Window */}
        <div className="col-span-2">
          {/* Nav Bar */}
          <Section title="Menu">
            <Tabs variant="soft-rounded">
              <TabList className="flex flex-wrap">
                {/* Use .map to loop over the panel names and render buttons */}
                {Object.entries(PANELS).map(([panelName, panelValue]) => (
                  <Tab
                    key={panelName}
                    onClick={() => setCurrentPanel(panelValue)}
                  >
                    {" "}
                    {panelName.charAt(0).toUpperCase() + panelName.slice(1)}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          </Section>

          <div className="p-2">{renderSideBarPanel()}</div>
          <CraftingPanel />
        </div>

        {/* Panel at the bottom */}
        <div className="col-span-4">
          <div className="mt-auto">
            {/* <MessagePanel messages={state.messages} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
