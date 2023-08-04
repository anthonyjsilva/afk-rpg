import { useState, useEffect } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChakraProvider, Button, Progress } from "@chakra-ui/react";
import "../node_modules/rpg-awesome/css/rpg-awesome.min.css";
import { hasChance } from "./helpers";
import {
  itemData,
  actionData,
  ActionData,
  mapActionData,
  locations,
} from "./data";
import { Inventory } from "./systems/inventory";
import {
  MessagePanel,
  CraftingPanel,
  InventoryPanel,
  Section,
} from "./components";
import "./index.css";

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface SaveData {
  lastLogin: Date;
  exploredLocations: string[];
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
  const thisActionData = actionData[currentAction];
  const newSaveData: SaveData = { ...saveFile };

  const isSuccess = hasChance(thisActionData.chance);
  if (isSuccess) {
    newSaveData.xp = (newSaveData.xp ?? 0) + 1;
    newSaveData.inv.add(thisActionData.item);
    newSaveData.messages = [
      `success#You got some ${itemData[thisActionData.item].name}`,
      ...saveFile.messages.slice(0, 9),
    ];
  }

  return newSaveData;
};

const loadSaveData = (): SaveData => {
  const prevSave = localStorage.getItem("afkrpg");
  if (prevSave) {
    let parsedSave: SaveData = JSON.parse(prevSave) as SaveData;

    if (parsedSave.inv && Array.isArray(parsedSave.inv.items)) {
      parsedSave.inv = new Inventory(parsedSave.inv.items);
    } else {
      parsedSave.inv = new Inventory();
    }

    // Add this block to initialize exploredLocations if not available in the save data
    if (!parsedSave.exploredLocations) {
      parsedSave.exploredLocations = ["campsite"]; // Initialize with "campsite" as the starting location
    } else if (!parsedSave.exploredLocations.includes("campsite")) {
      // Add "campsite" to the exploredLocations if it's not already there
      parsedSave.exploredLocations = [
        ...parsedSave.exploredLocations,
        "campsite",
      ];
    }

    // if we left off doing award the player as if they were doing that action this whole time
    if (parsedSave.lastAction !== "none") {
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
      exploredLocations: ["pond"],
      lastLocation: "pond",
      lastAction: "none",
      inv: starterInv,
      messages: [],
    };
  }
};

function App(): JSX.Element {
  const [saveFile, setSaveFile] = useState<SaveData>(loadSaveData);
  const [currentLocation, setCurrentLocation] = useState<string>(
    saveFile.lastLocation
  );
  const [currentAction, setCurrentAction] = useState<string>(
    saveFile.lastAction
  );
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(
    saveFile.lastAction !== "none"
  );

  // New state for exploration
  const [isExploring, setIsExploring] = useState<boolean>(false);

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
    let actionInterval: number | undefined;

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
    if (currentAction === "none") {
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
    }
  };

  const handleExploration = () => {
    setCurrentAction("exploring");
    setIsActionInProgress(true);
    setIsExploring(true);

    setTimeout(() => {
      setIsActionInProgress(false);
      setIsExploring(false);

      // Randomly discover a new location
      const unexploredLocations = Object.keys(locations).filter(
        (loc) => !saveFile.exploredLocations.includes(loc)
      );

      if (unexploredLocations.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * unexploredLocations.length
        );
        const newLocation = unexploredLocations[randomIndex];
        setExploredLocations((prevLocations) => [
          ...prevLocations,
          newLocation,
        ]);

        // Display a message about the new location
        setSaveFile((prevSave) => {
          const messages = [
            `success#You have discovered a new location: ${locations[newLocation].label}!`,
            ...prevSave.messages.slice(0, 9),
          ];
          return { ...prevSave, messages };
        });
      } else {
        // Display a message if all locations are explored
        setSaveFile((prevSave) => {
          const messages = ["You have explored all available locations."];
          return { ...prevSave, messages };
        });
      }
    }, 2000);
  };

  // New function to handle exploration when clicking on a location
  const exploreNewLocation = (locationLabel: string) => {
    setCurrentAction("exploring");
    setIsActionInProgress(true);
    setIsExploring(true);

    setTimeout(() => {
      setIsActionInProgress(false);
      setIsExploring(false);

      const locationKey = Object.keys(locations).find(
        (key) => locations[key].label === locationLabel
      );

      if (locationKey) {
        setExploredLocations((prevLocations) => [
          ...prevLocations,
          locationKey,
        ]);

        // Display a message about the new location
        setSaveFile((prevSave) => {
          const messages = [
            `success#You have discovered a new location: ${locationLabel}!`,
            ...prevSave.messages.slice(0, 9),
          ];
          return { ...prevSave, messages };
        });
      }
    }, 2000);
  };

  return (
    <ChakraProvider>
      <div className="m-10 text-center ">
        <h1 className="text-blue-500 text-7xl font-extrabold p-4 mt-10">
          <i className="ra ra-sword"></i>
          {` AFK RPG `}
          <i className="ra ra-castle-flag"></i>
        </h1>

        <div className="grid grid-cols-3">
          <MessagePanel messages={saveFile.messages} />

          <Section title="Character Stats">
            <div className="flex flex-row justify-center space-x-10 p-10">
              <img width={100} src={"/person.png"} alt="logo" />
            </div>

            <div>XP {saveFile.xp}</div>
            <Progress value={saveFile.xp} colorScheme="blue" size="sm" mt={2} />

            <hr />
            <div className="my-4">
              <div>last login: {dayjs(saveFile.lastLogin).fromNow()}</div>

              <Button colorScheme="gray" onClick={saveData}>
                Log Out
              </Button>
            </div>
          </Section>

          {/* New "Map" Section */}
          <Section title="Map">
            <h3 className="text-xl uppercase font-bold">{currentLocation}</h3>
            Current location
            <table>
              <tbody>
                {Object.values(locations).map((locationData, index) => {
                  const locationKey = Object.keys(locations)[index];
                  const Icon = locationData.icon as React.ElementType;

                  // Check if the location is already explored
                  const isExplored =
                    saveFile.exploredLocations.includes(locationKey);

                  // Show only explored locations
                  if (isExplored) {
                    return (
                      <tr
                        key={locationData.label}
                        onClick={() => changeLocation(locationKey)}
                        className="cursor-pointer"
                      >
                        <td className="flex items-center">
                          <Icon className="mr-2" />
                          {locationData.label}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
            {/* Exploration Button */}
            <div className="m-4">
              {isExploring ? (
                <Button colorScheme="gray" disabled>
                  Exploring...
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleExploration}>
                  Explore New Location
                </Button>
              )}
            </div>
          </Section>

          <Section title="Actions">
            <div className="mb-4">
              <h3 className="text-xl">Current action</h3>
              <p className="mb-2">{currentAction}</p>
              {isActionInProgress && <Progress size="lg" isIndeterminate />}
            </div>

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

          <CraftingPanel inv={saveFile.inv} />
        </div>

        <InventoryPanel inv={saveFile.inv} />
      </div>
    </ChakraProvider>
  );
}

export default App;
