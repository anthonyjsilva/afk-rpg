import { BadgeProps } from "@chakra-ui/react";
import {
  FaWater,
  FaMountain,
  FaTree,
  FaCity,
  FaSkull,
  FaUmbrellaBeach,
} from "react-icons/fa";

import { GiMining } from "react-icons/gi";
import { hasChance } from "../helpers";
import itemData from "./itemData";

export { default as itemData } from "./itemData";

export const typeColorMap: Record<string, BadgeProps["colorScheme"]> = {
  tool: "gray",
  resource: "green",
  consumable: "purple",
  loot: "yellow",
  key: "orange",
  weapon: "red",
  armor: "teal",
};

export type ItemData = {
  name: string;
  description?: string;
  image: string;
  type: keyof typeof typeColorMap;
};

export type locationData = Record<
  string,
  {
    label: string;
    icon: any;
  }
>;

// fix linting error for icon type
export const locations: locationData = {
  // starting location
  campsite: { label: "Campsite", icon: FaTree },

  // water locations
  pond: { label: "Pond", icon: FaWater },
  river: { label: "River", icon: FaWater },
  ocean: { label: "Ocean", icon: FaWater },
  beach: { label: "Beach", icon: FaUmbrellaBeach },

  // land locations
  mine: { label: "Mine", icon: FaMountain },
  forest: { label: "Forest", icon: FaTree },

  // town locations
  town: { label: "Town", icon: FaCity },
  dungeon: { label: "Dungeon", icon: FaSkull },
  castle: { label: "Castle", icon: FaCity },
};

export const houses = {
  tent: {
    label: "Tent",
    image: "tent.svg",
    cost: 0,
    income: 0,
    capacity: 2,
  },
  hut: {
    label: "Hut",
    image: "hut.svg",
    cost: 100,
    income: 0,
    capacity: 4,
  },
  house: {
    label: "House",
    image: "house.svg",
    cost: 500,
    income: 0,
    capacity: 6,
  },
  manor: {
    label: "Manor",
    image: "manor.svg",
    cost: 1000,
    income: 0,
    capacity: 8,
  },
  castle: {
    label: "Castle",
    image: "castle.svg",
    cost: 1000,
    income: 0,
    capacity: 8,
  },
};

export const monsters = {
  slime: {
    label: "Slime",
    image: "slime.svg",
    hp: 10,
    atk: 1,
    def: 1,
    exp: 10,
    gold: 10,
  },
  goblin: {
    label: "Goblin",
    image: "goblin.svg",
    hp: 20,
    atk: 2,
    def: 2,
    exp: 20,
    gold: 20,
  },
  skeleton: {
    label: "Skeleton",
    image: "skeleton.svg",
    hp: 30,
    atk: 3,
    def: 3,
    exp: 30,
    gold: 30,
  },
  dragon: {
    label: "Dragon",
    image: "dragon.svg",
    hp: 40,
    atk: 4,
    def: 4,
    exp: 40,
    gold: 40,
  },
};

export type ActionData = Record<
  string,
  {
    energyCost?: number;
    label: string;
    color: string;
    xp: number;
    item: string | string[] | null; // Fix the typing here to allow null
    chance: number;
    location: string[];
    tool: string | null; // Fix the typing here to allow null
    successFn?: (args: { state: SaveData; dispatch: any }) => void; // Fix the typing here to include 'state' parameter
  }
>;

export const actionData: ActionData = {
  sleeping: {
    energyCost: 5,
    label: "Sleeping",
    color: "purple",
    xp: 0,
    item: null,
    successFn: ({ dispatch }) => {
      // dispatch({ type: "SET_ENERGY", payload: 1 });
      dispatch({
        type: "ADD_MESSAGE",
        payload: "success#You sleep well. (+1 Energy)",
      });
    },
    chance: 80,
    location: [
      "town",
      "campsite",
      "forest",
      "house",
      "castle",
      "pond",
      "river",
      "beach",
    ],
    tool: "tent",
  },
  fishing: {
    label: "Fishing",
    color: "blue",
    xp: 1,
    item: "fish",
    chance: 20,
    location: ["pond", "river", "beach", "ocean"],
    tool: "net",
  },
  chopping: {
    label: "Chopping",
    color: "green",
    xp: 1,
    item: "wood",
    chance: 40,
    location: ["forest", "campsite"],
    tool: "axe",
  },
  mining: {
    label: "Mining",
    color: "gray",
    xp: 1,
    item: "metal",
    chance: 30,
    location: ["mine"],
    tool: "pickaxe",
  },
  fighting: {
    energyCost: -2,
    label: "Fighting",
    color: "facebook",
    xp: 2,
    item: "key",
    chance: 50,
    location: ["dungeon", "castle"],
    tool: "sword",
  },
  exploring: {
    energyCost: -5,
    label: "Exploring",
    color: "orange",
    xp: 1,
    successFn: ({ state, dispatch }) => {
      const thisLocation = state.locations[state.locationExplorationIndex];
      state.locations[
        state.locationExplorationIndex
      ].explorationPercentage += 10;
      dispatch({
        type: "ADD_MESSAGE",
        payload: `You manage to explore more of the area. (${thisLocation.explorationPercentage}%)`,
      });

      if (thisLocation.explorationPercentage === 100) {
        state.locations[state.locationExplorationIndex].isExplored = true;
        const xpGain = 25;
        dispatch({ type: "ADD_XP", payload: xpGain });
        dispatch({
          type: "ADD_MESSAGE",
          payload: `success#You have fully explored the ${thisLocation.name}! (+${xpGain}XP)`,
        });
        dispatch({ type: "SET_CURRENT_ACTION", payload: "none" });
      } else {
        if (hasChance(50)) {
          const items = ["key", "gold", "wood", "metal", "fish"];
          const randomIndex = Math.floor(Math.random() * items.length);
          const randomItemName = items[randomIndex];
          state.inv.add(randomItemName);

          dispatch({
            type: "ADD_MESSAGE",
            payload: `success#While exploring you find a ${itemData[randomItemName].name}`,
          });
        }
      }

      // if (unexploredLocations.length > 0) {
      //   const randomIndex = Math.floor(
      //     Math.random() * unexploredLocations.length
      //   );
      //   const newLocation = unexploredLocations[randomIndex];

      //   dispatch({ type: "ADD_LOCATION", payload: newLocation });
      //   dispatch({
      //     type: "ADD_MESSAGE",
      //     payload: `success#You have discovered a new location: ${locations[newLocation].label}!`,
      //   });
      // }
    },
    item: null, //["key", "gold", "wood", "metal", "fish"],
    chance: 30,
    location: ["all"],
    tool: null,
  },
};

export const forEachAction = (
  data: ActionData,
  callback: (key: string, value: ActionData[string]) => void
) => {
  Object.entries(data).forEach(([key, value]) => {
    callback(key, value);
  });
};

export const mapActionData = (
  data: ActionData,
  callback: (key: string, value: ActionData[string]) => JSX.Element
) => {
  return Object.entries(data).map(([key, value]) => {
    return callback(key, value);
  });
};
