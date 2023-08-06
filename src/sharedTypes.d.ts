interface SaveData {
  lastLogin: Date;
  lastActive: Date;
  exploredLocations: string[];
  currentLocation: string;
  currentAction: string;
  messages: string[];
  xp: number;
  inv: Inventory;
  quest: object[];
}
