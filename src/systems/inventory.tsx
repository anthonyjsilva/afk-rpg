export type InventoryItem = {
  id: string;
  amt: number;
};

export class Inventory {
  public items: InventoryItem[];

  constructor(items: InventoryItem[] = []) {
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

  public get(): InventoryItem[] {
    return this.items;
  }
}
