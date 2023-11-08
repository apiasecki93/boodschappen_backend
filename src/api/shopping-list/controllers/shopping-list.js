"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::shopping-list.shopping-list",
  ({ strapi }) => ({
    async upsertEntry(ctx) {
      try {
        const { productId, quantity, userId } = ctx.request.body;
        console.log(
          `Received productId: ${productId}, userId: ${userId}, quantity: ${quantity}`
        );

        const shoppingListId = 1; // The ID of the shopping list

        // Fetch the existing shopping list with related users and products
        const existingList = await strapi.entityService.findOne(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            populate: {
              dynamicShoppingList: { populate: ["product", "users"] },
            },
          }
        );

        console.log("Existing list:", JSON.stringify(existingList, null, 2));

        if (!existingList) {
          console.log("Shopping list not found");
          return ctx.notFound("Shopping list not found");
        }

        // Find if the product already exists in the list
        let productEntry = existingList.dynamicShoppingList.find(
          (entry) => entry.product && entry.product.id === productId
        );
        let productEntryIndex = existingList.dynamicShoppingList.findIndex(
          (entry) => entry.product && entry.product.id === productId
        );

        console.log(`Product entry index: ${productEntryIndex}`);

        if (!productEntry) {
          console.log(
            "Product not found in the list, adding new product with user and quantity"
          );

          // Before pushing the new product, ensure the user exists
          const userExists = await strapi.entityService.findOne(
            "plugin::users-permissions.user",
            userId
          );

          if (!userExists) {
            console.log(`User with ID ${userId} does not exist.`);
            return ctx.badRequest(`User with ID ${userId} does not exist.`);
          }

          // Product not found, add new product with user and quantity
          existingList.dynamicShoppingList.push({
            __component: "entry.user-product-entry",
            product: productId,
            quantity: quantity,
            users: [{ id: userId }], // Assuming this is the correct way to relate users in your setup
          });
        } else {
          // Product found, check if user has already added the product
          let userIndex = productEntry.users.findIndex(
            (user) => user.id === userId
          );
          console.log(`User index: ${userIndex}`);

          if (userIndex === -1) {
            // User not found in the product, add the user
            console.log("User not found in product entry, adding user");
            productEntry.users.push({ id: userId });
          }

          // Update the quantity for the product entry
          console.log("Updating quantity for the product entry");
          productEntry.quantity += quantity;
        }

        // Update the shopping list with the new dynamic zone data
        const updatedList = await strapi.entityService.update(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            data: {
              dynamicShoppingList: existingList.dynamicShoppingList,
            },
          }
        );

        console.log("Updated list:", JSON.stringify(updatedList, null, 2));

        ctx.body = { message: "Entry upserted successfully" };
      } catch (error) {
        console.error("Error upserting entry:", error);
        ctx.badRequest("Error upserting entry", { error });
      }
    },
    async findAll(ctx) {
      try {
        // Fetch all shopping lists with populated dynamicShoppingList
        const shoppingLists = await strapi.entityService.findMany(
          "api::shopping-list.shopping-list",
          {
            populate: {
              dynamicShoppingList: { populate: ["product", "users"] },
            },
          }
        );

        ctx.body = shoppingLists;
      } catch (error) {
        ctx.badRequest("Cannot fetch shopping lists", { error });
      }
    },
  })
);
