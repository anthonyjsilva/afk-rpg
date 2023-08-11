// GameStateContext.js
import { createContext, useContext, useReducer } from "react";
import { actionData, itemData, locations } from "./data/data";
import { Inventory, InventoryItem } from "./systems/inventory";
import { calculateXPRequired, hasChance } from "./helpers";
import dayjs from "dayjs";
import { GAME_INTERVALS_PER_MINUTE } from "./data/constants";

const starterInv = new Inventory();
starterInv.add("tent");
starterInv.add("net");
starterInv.add("wood", 100);
starterInv.add("metal", 100);
// starterInv.add("pickaxe");
// starterInv.add("axe");
// starterInv.add("shovel");
// starterInv.add("key", 10);

const baseAfkResults = {
  energyDiff: 0,
  lastActive: new Date(),
  minutes: 0,
  xp: 0,
  gold: 0,
  inv: new Inventory(),
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateInitialLocations = () => {
  // 3x3 grid
  const mapSize = 9;
  const initialLocations = [];
  const locationNames = Object.keys(locations);
  for (let i = 0; i < mapSize - 1; i++) {
    const randomIndex = Math.floor(Math.random() * locationNames.length);
    initialLocations.push({
      name: locationNames[randomIndex],
      explorationPercentage: 0,
      isExplored: false,
    });
  }
  initialLocations.push({
    name: "campsite",
    explorationPercentage: 100,
    isExplored: true,
  });

  return initialLocations;
};

// Define initial state and reducer function
const initialState: SaveData = {
  stats: {
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
  },
  afkResults: baseAfkResults,
  xp: 0,
  level: 1,
  gold: 0,
  lastLogin: new Date(),
  lastActive: new Date(),
  locationExplorationIndex: null,
  locations: generateInitialLocations(),
  currentLocation: "campsite",
  currentAction: "none",
  inv: starterInv,
  messages: ["Welcome to AFKRPG!", "You find yourself in a campsite."],
  quests: [
    {
      name: "Lumberjack",
      description: "Chop down 10 trees",
      isComplete: false,
      step: 0,
      maxStep: 10,
      reward: {
        xp: 100,
        gold: 100,
      },
    },
  ],
  path: "Lumberjack",
};

const loadSaveData = (): SaveData => {
  const prevSave = localStorage.getItem("afkrpg");

  // determine whether to use previous save data or start fresh
  if (prevSave) {
    // if we have a previous save, parse it and return it
    let parsedSave: SaveData = JSON.parse(prevSave) as SaveData;

    // reset the afkResults inventory object every time we load the save data
    parsedSave.afkResults = baseAfkResults;
    parsedSave.afkResults.lastActive = parsedSave.lastActive;

    // instantiate the inventory object from the parsed save data
    if (parsedSave.inv && Array.isArray(parsedSave.inv.items)) {
      parsedSave.inv = new Inventory(parsedSave.inv.items);
    } else {
      parsedSave.inv = new Inventory();
    }

    // reset the afkResults inventory object every time we load the save data
    if (
      parsedSave.afkResults &&
      Array.isArray(parsedSave.afkResults.inv.items)
    ) {
      parsedSave.afkResults.inv = new Inventory();
    }

    // Add this block to initialize exploredLocations if not available in the save data
    if (!parsedSave.exploredLocations) {
      // Initialize with "campsite" as the starting location
      parsedSave.exploredLocations = ["campsite"];
    } else if (!parsedSave.exploredLocations.includes("campsite")) {
      // Add "campsite" to the exploredLocations if it's not already there
      parsedSave.exploredLocations = [
        ...parsedSave.exploredLocations,
        "campsite",
      ];
    }

    // if we left off doing an action, award the player as if they were doing that action this whole time
    if (parsedSave.currentAction !== "none") {
      // calculate how many minutes have passed since the last login
      let minutesPassed = -dayjs(parsedSave.lastActive).diff(
        new Date(),
        "minute"
      );
      // always award at least 5 minutes of progress for testing purposes
      minutesPassed = Math.max(5, minutesPassed);
      parsedSave.afkResults.minutes = minutesPassed;

      // award XP and item for each minute that has passed
      if (minutesPassed >= 1) {
        const simulatedGameIntervals =
          minutesPassed * GAME_INTERVALS_PER_MINUTE;
        const thisActionData = actionData[parsedSave.currentAction];

        // only subtract energy if the action costs energy
        // reduce energy by 1 for each minute that has passed
        if (thisActionData.energyCost >= 0) {
          // Dispatch an action to update the game state with the new energy
          parsedSave.stats.energy += simulatedGameIntervals;
          parsedSave.afkResults.energyDiff = simulatedGameIntervals;
        } else if (
          thisActionData.energyCost < 0 ||
          thisActionData.energyCost === undefined
        ) {
          parsedSave.stats.energy -= simulatedGameIntervals;
          parsedSave.afkResults.energyDiff = -simulatedGameIntervals;
        }

        const hasRelevantPassive =
          parsedSave.currentAction === "chopping" &&
          parsedSave.path === "Lumberjack";
        const chanceMultiplier = hasRelevantPassive ? 2 : 1;
        const xpMultiplier = hasRelevantPassive ? 2 : 1;

        // should come from action data?
        const xpAmt = thisActionData.xp * xpMultiplier;
        const goldAmt = 0;

        for (let i = 0; i < simulatedGameIntervals; i++) {
          const isSuccess = hasChance(thisActionData.chance * chanceMultiplier);

          if (isSuccess) {
            parsedSave.xp += xpAmt;
            parsedSave.afkResults.xp += xpAmt;

            parsedSave.gold += goldAmt;
            parsedSave.afkResults.gold += goldAmt;

            // if this action type yield an item, add it to the inventory
            if (thisActionData.item) {
              parsedSave.inv.add(thisActionData.item);
              parsedSave.afkResults.inv.add(thisActionData.item);
            }
          }
        }
      }
    }

    return parsedSave;
  } else return initialState;
};

// Load the initial save data only once
const initialSaveData = loadSaveData();

// Define the possible action types
type ActionType =
  | { type: "SET_LOCATION"; payload: string }
  | { type: "ADD_LOCATION"; payload: string }
  | { type: "SET_CURRENT_ACTION"; payload: string }
  | { type: "ADD_MESSAGE"; payload: string }
  | { type: "SET_ENERGY"; payload: number }
  | { type: "ADD_XP"; payload: number }
  | { type: "UPDATE_INVENTORY"; payload: InventoryItem[] };

const gameStateReducer = (state: SaveData, action: ActionType): SaveData => {
  let newState;

  // Define how different actions will update the state
  switch (action.type) {
    // case "UPDATE_PLAYER":
    //   return { ...state, player: { ...state.player, ...action.payload } };
    case "SET_LOCATION":
      newState = {
        ...state,
        currentLocation: action.payload,
      };
      break;
    case "ADD_LOCATION":
      newState = {
        ...state,
        exploredLocations: [...state.exploredLocations, action.payload],
      };
      break;
    case "SET_CURRENT_ACTION":
      newState = {
        ...state,
        currentAction: action.payload,
      };
      break;

    case "ADD_MESSAGE":
      newState = {
        ...state,
        messages: [action.payload, ...state.messages.slice(0, 9)],
      };
      break;

    case "UPDATE_INVENTORY":
      newState = { ...state, inv: new Inventory(action.payload) };
      break;

    case "SET_ENERGY":
      newState = {
        ...state,
        stats: { ...state.stats, energy: state.stats.energy + action.payload },
      };
      break;

    case "ADD_XP": {
      const newXp = state.xp + action.payload;
      const currentLevel = state.level;
      const xpRequiredForNextLevel = calculateXPRequired(currentLevel);

      if (newXp >= xpRequiredForNextLevel) {
        // If the player has enough XP for the next level, increment the level
        const newLevel = currentLevel + 1;
        const levelUpMessage = `Congratulations! You've reached level ${newLevel}!`;
        const newMessages = [levelUpMessage, ...state.messages.slice(0, 9)];

        return {
          ...state,
          xp: newXp - xpRequiredForNextLevel,
          level: newLevel,
          messages: newMessages,
        };
      } else {
        // If not enough XP for the next level, just update the XP
        return {
          ...state,
          xp: newXp,
        };
      }
    }

    default:
      newState = state;
      break;
  }

  // update the last active time
  newState.lastActive = new Date();

  // save the game state to local storage
  saveToLS(newState as SaveData);
  return newState as SaveData;
};

// Create the context and provider
const GameStateContext = createContext<ReturnType<typeof useGameState> | null>(
  null
);

export const GameStateProvider: React.FC = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialSaveData);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook to access the state and dispatch from components
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

// manually end the session and save the game
const logOut = (state: SaveData): void => {
  console.log("logOut");
  saveToLS({ ...state, lastLogin: new Date() });
};

// save the game state to local storage
const saveToLS = (state: SaveData): void => {
  localStorage.setItem("afkrpg", JSON.stringify(state));
};
