interface Location {
  name: string;
  explorationPercentage: number;
  isExplored: boolean;
}

interface SaveData {
  lastLogin: Date;
  lastActive: Date;
  afkResults: {
    energyDiff: number;
    lastActive: Date;
    minutes: number;
    xp: number;
    gold: number;
    inv: Inventory;
  };
  currentLocation: string;
  locations: Location[];
  locationExplorationIndex: number;
  currentAction: string;
  messages: string[];
  stats: {
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
  };
  xp: number;
  level: number;
  age: number;
  gold: number;
  inv: Inventory;
  path: string;
  quests: [
    {
      name: string;
      description: string;
      isComplete: boolean;

      step: number;
      maxStep: number;
      reward: {
        xp: number;
        gold: number;
      };
    }
  ];
}
