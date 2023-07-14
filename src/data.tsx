import { BadgeProps, IconType } from "@chakra-ui/react";
import {
  FaWater,
  FaMountain,
  FaTree,
  FaCity,
  FaSkull,
  FaUmbrellaBeach,
} from "react-icons/fa";

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
  image: string;
  type: keyof typeof typeColorMap;
};

export const itemData: Record<string, ItemData> = {
  wood: {
    name: "Wood",
    image: "wood.svg",
    type: "resource",
  },
  metal: {
    name: "Metal",
    image: "metal.svg",
    type: "resource",
  },
  fish: {
    name: "Fish",
    image: "fish.svg",
    type: "resource",
  },
  potion: {
    name: "Potion",
    image: "potion.svg",
    type: "consumable",
  },
  chest: {
    name: "Chest",
    image: "chest.svg",
    type: "loot",
  },
  key: {
    name: "Key",
    image: "key.svg",
    type: "key",
  },
  sword: {
    name: "Sword",
    image: "sword.svg",
    type: "weapon",
  },
  shield: {
    name: "Shield",
    image: "shield.svg",
    type: "armor",
  },
  net: {
    name: "Net",
    image: "fishing-net.svg",
    type: "tool",
  },
  axe: {
    name: "Axe",
    image: "axe.svg",
    type: "tool",
  },
  pickaxe: {
    name: "Pickaxe",
    image: "pickaxe.svg",
    type: "tool",
  },
  tent: {
    name: "Tent",
    image: "tent.svg",
    type: "house",
  },
  shovel: {
    name: "Shovel",
    image: "pickaxe.svg",
    type: "tool",
  },
};

export type locationData = Record<
  string,
  {
    label: string;
    icon: IconType;
  }
>;

// fix linting error for icon type
export const locations: locationData = {
  pond: { label: "River", icon: FaWater },
  mine: { label: "Mine", icon: FaMountain },
  forest: { label: "Forest", icon: FaTree },
  town: { label: "Town", icon: FaCity },
  dungeon: { label: "Dungeon", icon: FaSkull },
  beach: { label: "Beach", icon: FaUmbrellaBeach },
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

export type InvItem = {
  id: string;
  amt: number;
};

export class Inventory {
  public items: InvItem[];

  constructor(items: InvItem[] = []) {
    this.items = items;
  }

  public add(id: string, amt = 1): void {
    const existingItem = this.items.find((item) => item.id === id);
    if (existingItem) {
      existingItem.amt += amt;
    } else {
      this.items.push({ id, amt });
    }
  }

  public remove(id: string, amt = 1): void {
    const existingItem = this.items.find((item) => item.id === id);
    if (existingItem) {
      existingItem.amt -= amt;
      if (existingItem.amt <= 0) {
        this.items = this.items.filter((item) => item.id !== id);
      }
    }
  }

  public getItemAmount(id: string): number {
    const existingItem = this.items.find((item) => item.id === id);
    return existingItem ? existingItem.amt : 0;
  }

  public hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }

  public get(): InvItem[] {
    return this.items;
  }
}

export type ActionData = Record<
  string,
  {
    label: string;
    color: string;
    item: string;
    chance: number;
    location: keyof typeof locations;
    tool: string;
  }
>;

export const actionData: ActionData = {
  fishing: {
    label: "Fishing",
    color: "blue",
    item: "fish",
    chance: 20,
    location: "pond",
    tool: "net",
  },
  chopping: {
    label: "Chopping",
    color: "green",
    item: "wood",
    chance: 40,
    location: "forest",
    tool: "axe",
  },
  mining: {
    label: "Mining",
    color: "gray",
    item: "metal",
    chance: 30,
    location: "mine",
    tool: "pickaxe",
  },
  fighting: {
    label: "Fighting",
    color: "brown",
    item: "key",
    chance: 50,
    location: "dungeon",
    tool: "sword",
  },
  exploring: {
    label: "Exploring",
    color: "orange",
    item: "chest",
    chance: 10,
    location: "beach",
    tool: "shovel",
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