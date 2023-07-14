import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChakraProvider, Badge, Button, Progress } from "@chakra-ui/react";
import { hasChance } from "./helpers";
import "../node_modules/rpg-awesome/css/rpg-awesome.min.css";
import {
  Inventory,
  invItem,
  itemData,
  actionData,
  ActionData,
  mapActionData,
  locations,
  typeColorMap,
} from "./data";
import Section from "./components/Section";
import { canCraftItem, craftItem, craftingRecipes } from "./crafting";

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface SaveData {
  lastLogin: Date;
  lastLocation: string;
  lastAction: string;
  messages: string[];
  xp: number;
  inv: Inventory;
}

const awardXPAndItem = (
  actionData: ActionData,
  currentAction: string,
  saveFile: SaveData
): SaveData => {
  const thisActionData = actionData[currentAction as keyof typeof actionData];
  const newSaveData: SaveData = { ...saveFile };

  const isSuccess = hasChance(thisActionData.chance);
  if (isSuccess) {
    newSaveData.xp = (newSaveData.xp ?? 0) + 1;
    newSaveData.inv.add(thisActionData.item);
    newSaveData.messages.push(
      `You got some ${itemData[thisActionData.item].name}`
    );
  }

  return newSaveData;
};

const loadSaveData = (): SaveData => {
  const prevSave = localStorage.getItem("afkrpg");
  if (false && prevSave) {
    let parsedSave: SaveData = JSON.parse(prevSave);

    if (parsedSave.inv && Array.isArray(parsedSave.inv.items)) {
      parsedSave.inv = new Inventory(parsedSave.inv.items);
    } else {
      parsedSave.inv = new Inventory();
    }

    const minutesPassed = -dayjs(parsedSave.lastLogin).diff(
      new Date(),
      "minute"
    );

    if (minutesPassed >= 1) {
      for (let i = 0; i < minutesPassed; i++) {
        parsedSave = awardXPAndItem(
          actionData,
          parsedSave.lastAction,
          parsedSave
        );
      }
    }

    return parsedSave;
  } else {
    const starterInv = new Inventory();
    starterInv.add("net");
    starterInv.add("pickaxe");
    starterInv.add("axe");
    starterInv.add("shovel");
    starterInv.add("key", 10);
    return {
      xp: 0,
      lastLogin: new Date(),
      lastLocation: "pond",
      lastAction: "none",
      inv: starterInv,
      messages: [],
    };
  }
};

function App(): JSX.Element {
  const [saveFile, setSaveFile] = useState<SaveData>(loadSaveData);
  const [currentLocation, setCurrentLocation] = useState(saveFile.lastLocation);
  const [currentAction, setCurrentAction] = useState(saveFile.lastAction);
  const [isActionInProgress, setIsActionInProgress] = useState(
    saveFile.lastAction !== "none"
  );

  const saveData = (): void => {
    setSaveFile((prevSave) => ({ ...prevSave, lastLogin: new Date() }));
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("afkrpg", JSON.stringify(saveFile));
  }, [saveFile]);

  useEffect(() => {
    setSaveFile((prevSave) => ({ ...prevSave, lastAction: currentAction }));
  }, [currentAction]);

  useEffect(() => {
    let actionInterval: NodeJS.Timer | undefined;

    if (isActionInProgress) {
      actionInterval = setInterval(() => {
        setSaveFile((prevSave) =>
          awardXPAndItem(actionData, currentAction, prevSave)
        );
      }, 2000);
    }

    return () => {
      if (actionInterval) {
        clearInterval(actionInterval);
      }
    };
  }, [isActionInProgress, currentAction]);

  const startAction = (action: string) => {
    setCurrentAction(action);
    setIsActionInProgress(true);
    setSaveFile((prevSave) => {
      const messages = [
        `You begin ${actionData[action].label}...`,
        ...prevSave.messages.slice(0, 9),
      ];
      return {
        ...prevSave,
        messages,
      };
    });
  };

  const endAction = () => {
    setCurrentAction("none");
    setIsActionInProgress(false);
    setSaveFile((prevSave) => {
      const messages = [
        `You stop ${actionData[prevSave.lastAction].label}.`,
        ...prevSave.messages.slice(0, 9),
      ];
      return {
        ...prevSave,
        messages,
      };
    });
  };

  const changeLocation = (newLocation: string) => {
    setCurrentLocation(newLocation);
    setSaveFile((prevSave) => {
      const messages = [
        `You travel from the ${prevSave.lastLocation} to ${newLocation}.`,
        ...prevSave.messages.slice(0, 9),
      ];
      return {
        ...prevSave,
        lastLocation: newLocation,
        messages,
      };
    });
  };

  return (
    <ChakraProvider>
      <div className="m-10 text-center ">
        <h1 className="text-blue-500 text-7xl font-extrabold p-4 mt-10">
          <i className="ra ra-sword"></i> AFK RPG{" "}
          <i className="ra ra-castle-flag"></i>
        </h1>

        <div className="grid grid-cols-3">
          <Section title="Messages">
            <ul>
              {saveFile.messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </Section>

          <Section title="Character Stats">
            <div className="flex flex-row justify-center space-x-10 p-10">
              <img width={100} src={"/person.png"} alt="logo" />
            </div>
            <div>XP {saveFile.xp}</div>
            <div>last login: {dayjs(saveFile.lastLogin).fromNow()}</div>
            <Progress value={saveFile.xp} colorScheme="blue" size="sm" mt={2} />
            <hr />
            <Button colorScheme="gray" onClick={saveData}>
              Log Out
            </Button>
          </Section>

          <Section title="Current Location">
            <h3 className="text-xl uppercase font-bold">{currentLocation}</h3>
            <div className="flex flex-wrap justify-center space-x-4">
              {Object.values(locations).map((locationData, index) => {
                if (locationData.label !== currentLocation) {
                  const Icon = locationData.icon;
                  return (
                    <Button
                      key={locationData.label}
                      colorScheme="gray"
                      onClick={() =>
                        changeLocation(Object.keys(locations)[index])
                      }
                      className="my-2"
                    >
                      <Icon className="mr-2" />
                      {locationData.label}
                    </Button>
                  );
                }
                return null;
              })}
            </div>
          </Section>

          <Section title="Actions">
            <h3 className="text-xl">Start</h3>
            <div className="flex flex-wrap justify-start align-top space-x-4">
              {mapActionData(actionData, (key, value) => {
                const isDisabled =
                  currentLocation !== value.location ||
                  !saveFile.inv.hasItem(value.tool);

                return (
                  <div key={key}>
                    <Button
                      isDisabled={isDisabled}
                      colorScheme={isDisabled ? "gray" : value.color}
                      onClick={() => {
                        isActionInProgress ? endAction() : startAction(key);
                      }}
                    >
                      {isActionInProgress && currentAction === key
                        ? "Stop"
                        : ""}{" "}
                      {value.label}
                    </Button>
                    {isDisabled && (
                      <p className="text-red-400">requires {value.tool}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Current action">
            {currentAction}
            {isActionInProgress && <Progress size="lg" isIndeterminate />}
          </Section>

          <Section title="Crafting">
            <div className="flex flex-wrap justify-start align-top space-x-4">
              {Object.keys(craftingRecipes).map((itemName) => {
                const recipe = craftingRecipes[itemName];
                const canCraft = canCraftItem(recipe, saveFile.inv);

                return (
                  <div
                    key={itemName}
                    className="flex justify-center items-center border-b border-stone-500"
                  >
                    <img
                      src={itemData[itemName].image}
                      alt={itemData[itemName].name}
                      className="w-6 h-6"
                    />
                    <div>
                      <h3>{itemData[itemName].name}</h3>
                      {Object.entries(recipe).map(
                        ([requiredItem, requiredAmount]) => (
                          <p key={requiredItem}>
                            {requiredAmount} {itemData[requiredItem].name}
                          </p>
                        )
                      )}
                    </div>
                    <Button
                      isDisabled={!canCraft}
                      colorScheme={canCraft ? "green" : "gray"}
                      onClick={() => craftItem(itemName, recipe, saveFile.inv)}
                    >
                      Craft
                    </Button>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <Section title="Inventory">
          <div className="flex flex-row justify-center space-x-10 p-4 m-4">
            {saveFile.inv.items.map(({ id, amt }: invItem) => (
              <div key={id}>
                <img
                  className="rounded-xl"
                  width={100}
                  src={itemData[id].image}
                  alt={itemData[id].name}
                />

                <p>
                  {itemData[id].name} <span className="italic">(x{amt})</span>
                </p>
                <Badge colorScheme={typeColorMap[itemData[id].type]}>
                  {itemData[id].type}
                </Badge>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </ChakraProvider>
  );
}

export default App;
