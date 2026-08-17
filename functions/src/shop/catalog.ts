import type {ShopCatalogItem} from "../types.js";

export const SHOP_CATALOG = new Map<string, ShopCatalogItem>([
  ["hint_reveal", {
    price: 18,
    type: "consumable",
    uses: 1,
    maxOwned: 3,
  }],
  ["fifty_fifty", {
    price: 24,
    type: "consumable",
    uses: 1,
    maxOwned: 3,
  }],
  ["time_freeze", {
    price: 14,
    type: "consumable",
    uses: 1,
    maxOwned: 3,
  }],
  ["theme_dark", {price: 250, type: "cosmetic"}],
  ["theme_gold", {price: 500, type: "cosmetic"}],
  ["avatar_scholar", {price: 180, type: "cosmetic"}],
  ["avatar_champion", {price: 650, type: "cosmetic"}],
]);
