"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::shopping-list.shopping-list",
  ({ strapi }) => ({
    async upsertEntry(ctx) {
      try {
        const userId = ctx.state.user.id;
        // console.log(`User ID: ${userId}`);
        if (!userId) return ctx.unauthorized();
        const { productId, quantity } = ctx.request.body;
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
        // console.log(existingList);
        // console.log("Existing list:", JSON.stringify(existingList, null, 2));

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
            // console.log(`User with ID ${userId} does not exist.`);
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
          // console.log(`User index: ${userIndex}`);

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
        console.log(updatedList);
        // console.log("Updated list:", JSON.stringify(updatedList, null, 2));

        ctx.body = { message: "Entry upserted successfully", updatedList };
      } catch (error) {
        console.error("Error upserting entry:", error);
        ctx.badRequest("Error upserting entry", { error });
      }
    },
    async findAll(ctx) {
      try {
        // Fetch all shopping lists with populated dynamicShoppingList, images, and creator
        const shoppingLists = await strapi.entityService.findMany(
          "api::shopping-list.shopping-list",
          {
            populate: {
              dynamicShoppingList: {
                populate: {
                  product: { populate: ["image", "creator"] },
                  users: true,
                  creator: true,
                },
              },
            },
          }
        );

        ctx.body = shoppingLists;
      } catch (error) {
        ctx.badRequest("Cannot fetch shopping lists", { error });
      }
    },

    async reduceProductQuantity(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();
      try {
        const { productId, quantityToReduce } = ctx.request.body;
        // console.log(
        //   `Received productId: ${productId}, quantityToReduce: ${quantityToReduce}`
        // );

        const shoppingListId = 1; // The ID of the shopping list

        // Fetch the existing shopping list
        const existingList = await strapi.entityService.findOne(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            populate: { dynamicShoppingList: { populate: ["product"] } },
          }
        );

        if (!existingList) {
          // console.log("Shopping list not found");
          return ctx.notFound("Shopping list not found");
        }

        // Find the product entry in the list
        const productEntryIndex = existingList.dynamicShoppingList.findIndex(
          (entry) => entry.product && entry.product.id === productId
        );

        if (productEntryIndex === -1) {
          // console.log("Product not found in the list");
          return ctx.notFound("Product not found in the list");
        }

        // Get the current quantity of the product
        const currentQuantity =
          existingList.dynamicShoppingList[productEntryIndex].quantity;

        // Check if there is enough quantity to reduce
        if (quantityToReduce > currentQuantity) {
          // Not enough product to reduce
          return ctx.badRequest("Not enough product to reduce");
        }

        // Reduce the quantity of the product
        existingList.dynamicShoppingList[productEntryIndex].quantity -=
          quantityToReduce;

        // Update the shopping list
        const updatedList = await strapi.entityService.update(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            data: {
              dynamicShoppingList: existingList.dynamicShoppingList,
            },
          }
        );

        ctx.body = { message: "Product quantity reduced successfully" };
      } catch (error) {
        console.error("Error reducing product quantity:", error);
        ctx.badRequest("Error reducing product quantity", { error });
      }
    },

    async removeEntry(ctx) {
      try {
        const { productId } = ctx.request.body;
        const shoppingListId = 1; // Assuming a single shopping list for simplicity

        // Fetch the existing shopping list
        const existingList = await strapi.entityService.findOne(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            populate: {
              dynamicShoppingList: { populate: ["product", "users"] },
            },
          }
        );

        if (!existingList) {
          return ctx.notFound("Shopping list not found");
        }

        // Find the product entry index in the list
        const productEntryIndex = existingList.dynamicShoppingList.findIndex(
          (entry) => entry.product && entry.product.id === productId
        );

        if (productEntryIndex === -1) {
          return ctx.notFound("Product not found in the list");
        }

        // Remove the product entry from the list
        existingList.dynamicShoppingList.splice(productEntryIndex, 1);

        // Update the shopping list
        const updatedList = await strapi.entityService.update(
          "api::shopping-list.shopping-list",
          shoppingListId,
          {
            data: {
              dynamicShoppingList: existingList.dynamicShoppingList,
            },
          }
        );

        ctx.body = {
          message: "Product entry removed successfully",
          updatedList,
        };
      } catch (error) {
        console.error("Error removing product entry:", error);
        ctx.badRequest("Error removing product entry", { error });
      }
    },
  })
);
