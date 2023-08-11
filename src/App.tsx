import { useEffect, useState } from "react";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import ItemsList from "./components/ItemsList";

dayjs.extend(duration);
dayjs.extend(relativeTime);

function App(): JSX.Element {
  const { state } = useGameState();
  const [isOpen, setIsOpen] = useState(state.currentAction !== "none");
  const [currentPanel, setCurrentPanel] = useState("character");

  const PANELS = {
    CHARACTER: "character",
    INVENTORY: "inventory",
    QUEST: "quest",
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const renderSideBarPanel = () => {
    switch (currentPanel) {
      case PANELS.CHARACTER:
        return <CharacterPanel />;
      case PANELS.INVENTORY:
        return <InventoryPanel inv={state.inv} />;
      case PANELS.QUEST:
        return <QuestPanel />;
      default:
        return null;
    }
  };

  // use effect hook that runs when the component mounts
  // useEffect(() => {
  //   // check if the user has a saved game in local storage
  // }, []);

  return (
    <div className="m-10 text-center">
      <h1 className="text-blue-500 text-7xl font-extrabold p-4 mt-10">
        <i className="ra ra-sword"></i>
        {` AFK RPG `}
        <i className="ra ra-castle-flag"></i>
      </h1>

      <div className="flex justify-between">
        <Button
          onClick={() => {
            localStorage.removeItem("afkrpg");
          }}
          colorScheme="red"
        >
          DELETE SAVE
        </Button>
        <Button onClick={onOpen}>Show results from last AFK</Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AFK Results</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>Since {dayjs(state.afkResults.lastActive).fromNow()}</div>
            <hr />
            <div>
              {state.currentAction} for {state.afkResults.minutes} minutes :
            </div>
            <hr />

            <StatGroup>
              <Stat>
                <StatLabel>XP</StatLabel>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {state.afkResults.xp}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Gold</StatLabel>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {state.afkResults.gold}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Energy</StatLabel>
                <StatHelpText>
                  <StatArrow
                    type={
                      Math.sign(state.afkResults.energyDiff) > 0
                        ? "increase"
                        : "decrease"
                    }
                  />
                  {state.afkResults.energyDiff}
                </StatHelpText>
              </Stat>
            </StatGroup>
            <hr />
            <div>Loot:</div>
            <ItemsList items={state.afkResults.inv.items} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={onClose}>
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
