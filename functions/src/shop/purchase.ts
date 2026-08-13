import {FieldValue} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";
import {db} from "../firebase.js";
import {asString} from "../shared/validation.js";
import type {PurchaseShopItemInput} from "../types.js";
import {SHOP_CATALOG} from "./catalog.js";

export async function purchaseShopItemForUser(
  userId: string,
  input: PurchaseShopItemInput
) {
  const itemId = asString(input.itemId, "itemId");
  const item = SHOP_CATALOG.get(itemId);

  if (!item) {
    throw new HttpsError(
      "not-found",
      "Цей предмет більше не доступний у Майстерні."
    );
  }

  const userRef = db.collection("users").doc(userId);

  return db.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "Профіль користувача не знайдено.");
    }

    const user = userSnapshot.data() ?? {};
    const currentCoins = Number(user.coins ?? 0);
    if (!Number.isFinite(currentCoins) || currentCoins < item.price) {
      throw new HttpsError(
        "failed-precondition",
        "Недостатньо Nexons для цієї покупки."
      );
    }

    const nextCoins = currentCoins - item.price;
    if (item.type === "cosmetic") {
      const inventory = Array.isArray(user.inventory) ?
        user.inventory.map(String) :
        [];
      if (inventory.includes(itemId)) {
        throw new HttpsError(
          "failed-precondition",
          "Цей предмет уже є у вашій колекції."
        );
      }

      transaction.update(userRef, {
        coins: nextCoins,
        inventory: FieldValue.arrayUnion(itemId),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        itemId,
        itemType: "cosmetic" as const,
        coins: nextCoins,
        ownedCount: 1,
      };
    }

    const consumables = typeof user.consumables === "object" &&
      user.consumables !== null ?
      user.consumables as Record<string, unknown> :
      {};
    const currentCount = Math.max(0, Number(consumables[itemId] ?? 0));
    const uses = Math.max(1, Number(item.uses ?? 1));
    const maxOwned = Math.max(uses, Number(item.maxOwned ?? uses));
    if (currentCount + uses > maxOwned) {
      throw new HttpsError(
        "failed-precondition",
        `У рюкзаку може бути не більше ${maxOwned} таких предметів.`
      );
    }

    const ownedCount = currentCount + uses;
    transaction.update(userRef, {
      coins: nextCoins,
      [`consumables.${itemId}`]: ownedCount,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      itemId,
      itemType: "consumable" as const,
      coins: nextCoins,
      ownedCount,
    };
  });
}
