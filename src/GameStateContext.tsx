// GameStateContext.js
import { createContext, useContext, useReducer } from "react";
import { actionData, itemData } from "./data";
import { Inventory, InventoryItem } from "./systems/inventory";
import { hasChance } from "./helpers";
import dayjs from "dayjs";

const starterInv = new Inventory();
starterInv.add("net");
starterInv.add("wood", 10);
starterInv.add("metal", 10);
// starterInv.add("pickaxe");
// starterInv.add("axe");
// starterInv.add("shovel");
// starterInv.add("key", 10);

// Define initial state and reducer function
const initialState: SaveData = {
  xp: 0,
  lastLogin: new Date(),
  lastActive: new Date(),
  exploredLocations: ["campsite"],
  currentLocation: "campsite",
  currentAction: "none",
  inv: starterInv,
  messages: ["Welcome to AFKRPG!", "You find yourself in a campsite."],
};

const awardXPAndItem = (state: SaveData): SaveData => {
  const thisActionData = actionData[state.currentAction];

  const isSuccess = hasChance(thisActionData.chance);

  if (isSuccess) {
    state.xp += 1;
    state.inv.add(thisActionData.item);
    state.messages = [
      `success#You got some ${itemData[thisActionData.item].name}`,
      ...state.messages.slice(0, 9),
    ];
  }

  return state;
};

const loadSaveData = (): SaveData => {
  const prevSave = localStorage.getItem("afkrpg");

  // determine whether to use previous save data or start fresh
  if (prevSave) {
    // if we have a previous save, parse it and return it
    let parsedSave: SaveData = JSON.parse(prevSave) as SaveData;

    // instantiate the inventory object from the parsed save data
    if (parsedSave.inv && Array.isArray(parsedSave.inv.items)) {
      parsedSave.inv = new Inventory(parsedSave.inv.items);
    } else {
      parsedSave.inv = new Inventory();
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
      const minutesPassed = -dayjs(parsedSave.lastActive).diff(
        new Date(),
        "minute"
      );

      // award XP and item for each minute that has passed
      if (minutesPassed >= 1) {
        for (let i = 0; i < minutesPassed; i++) {
          parsedSave = awardXPAndItem(parsedSave);
        }
      }
    }

    return parsedSave;
  } else return initialState;
};

// Define the possible action types
type ActionType =
  | { type: "SET_LOCATION"; payload: string }
  | { type: "ADD_LOCATION"; payload: string }
  | { type: "SET_CURRENT_ACTION"; payload: string }
  | { type: "ADD_MESSAGE"; payload: string }
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
  const [state, dispatch] = useReducer(gameStateReducer, loadSaveData());

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
