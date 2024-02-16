const _ = require("lodash");

const jwt = require("jsonwebtoken");

// const { parseMultipartData } = require("@strapi/utils");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

module.exports = (plugin) => {
  //UPDATE ME CONTROLLER

  plugin.controllers.user.updateMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // console.log(ctx.request.body);
    if (ctx.is("multipart")) {
      // const { data, files } = parseMultipartData(ctx);
      ctx.request.body = _.pick(data, ["firstname", "lastname"]);
      ctx.params = { id: user.id };

      const result = await strapi.plugins.upload.services.upload.upload({
        data: {
          refId: user.id,
          ref: "plugin::users-permissions.user",
          source: "users-permissions",
          field: "thumbnail",
        },
        files: files.thumbnail,
      });
      if (result) {
        return await strapi.plugins["users-permissions"]
          .controller("user")
          .update(ctx);
      }
    }

    // Pick only specific fields for security
    ctx.request.body = _.pick(ctx.request.body, ["firstname", "lastname"]);
    ctx.params = { id: user.id };
    return await strapi.plugins["users-permissions"]
      .controller("user")
      .update(ctx);
  };

  //CONFIRM ME CONTROLLER
  plugin.controllers.user.confirmMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const entry = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
      });

    if (!entry) return ctx.badRequest("Could not find user", { ok: false });
    if (entry.authorStatus == "Confirmed")
      return ctx.badRequest("User already confirmed", { ok: false });
    if (entry.authorStatus == "Requested confirmation")
      return ctx.badRequest("User confirmation already pending", { ok: false });
    if (!entry.authorStatus || entry.authorStatus == "None") {
      ctx.params = { id: user.id };
      ctx.request.body = {
        authorStatus: "Requested confirmation",
      };
      return await strapi.plugins["users-permissions"]
        .controller("user")
        .update(ctx);
    }
    return ctx.badRequest("Unknown error", { ok: false });
  };

  //ADD FAVORITE CONTROLLER
  // plugin.controllers.user.UpdateFavorites = async (ctx) => {
  //   const { id: userId } = ctx.state.user;
  //   if (!userId) return ctx.unauthorized();

  //   const newFavorites = ctx.request.body?.data?.favorites;
  //   if (newFavorites && Array.isArray(newFavorites)) {
  //     ctx.params = { id: userId };
  //     ctx.request.body = {
  //       favorites: newFavorites,
  //     };

  //     return await strapi.plugins["users-permissions"]
  //       .controller("user")
  //       .update(ctx);
  //   }

  //   return ctx.badRequest("Favorites needs to be an array", { ok: false });
  // };

  // plugin.controllers.user.FavoritesUpdate = async (ctx) => {
  //   try {
  //     const userId = ctx.state.user.id;
  //     const { productId } = ctx.request.body;

  //     console.log("userId:", userId);
  //     console.log("productId:", productId);

  //     if (!productId) {
  //       return ctx.badRequest("Product ID is missing");
  //     }

  //     const user = await strapi.db
  //       .query("plugin::users-permissions.user")
  //       .findOne({ where: { id: userId }, populate: ["favorites"] });

  //     console.log("user:", user);

  //     if (!user) {
  //       return ctx.notFound("User not found");
  //     }

  //     const alreadyFavorited = user.favorites.some(
  //       (fav) => fav.id == productId
  //     );

  //     console.log("alreadyFavorited:", alreadyFavorited);

  //     let updatedFavoritesIds;
  //     if (alreadyFavorited) {
  //       updatedFavoritesIds = user.favorites.filter(
  //         (fav) => fav.id != productId
  //       );
  //     } else {
  //       const product = await strapi.db
  //         .query("product")
  //         .findOne({ where: { id: productId } });

  //       console.log("product:", product);

  //       if (!product) {
  //         return ctx.notFound("Product not found");
  //       }
  //       updatedFavoritesIds = [...user.favorites, product];
  //     }

  //     console.log("updatedFavoritesIds:", updatedFavoritesIds);

  //     const updatedFavoritesIdsArray = updatedFavoritesIds.map((fav) => fav.id);

  //     console.log("updatedFavoritesIdsArray:", updatedFavoritesIdsArray);

  //     const updatedUser = await strapi.db
  //       .query("plugin::users-permissions.user")
  //       .update(
  //         { id: userId },
  //         { favorites: updatedFavoritesIdsArray } // Updated this line
  //       );

  //     console.log("updatedUser:", updatedUser);

  //     return ctx.send(updatedUser);
  //   } catch (error) {
  //     console.error(`Error in toggleFavorite: ${error.message}`);
  //     return ctx.internalServerError("An error occurred");
  //   }
  // };

  plugin.controllers.user.changePassword = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { currentPassword, newPassword } = ctx.request.body;
    if (!currentPassword || !newPassword) {
      return ctx.badRequest("Current and new passwords are required");
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return ctx.forbidden("Current password is incorrect");
    }

    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // console.log(hashedPassword);
    // console.log(newPassword); // 10 is the salt rounds
    ctx.params = { id: user.id };
    ctx.request.body = {
      password: newPassword,
    };

    return await strapi.plugins["users-permissions"]
      .controller("user")
      .update(ctx);
  };

  plugin.controllers.user.changeUserInfo = async (ctx) => {
    // console.log("TRIGERED chanegeUserInfo")
    const user = ctx.state.user;
    // console.log(user);
    if (!user) return ctx.unauthorized();
    // console.log(ctx.request.body);
    const { username, email, firstname, lastname, thumbnail } =
      ctx.request.body;
    // console.log(lastname);
    // Create an object to hold the updated fields
    let updates = {};

    // Check each field to see if it was provided, and if so, add it to the updates object
    if (username) updates.username = username;
    if (email) updates.email = email;
    // console.log(email)
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (thumbnail) updates.thumbnail = thumbnail;
    // console.log(thumbnail);
    if (thumbnail) {
      const result = await strapi.plugins.upload.services.upload.upload({
        data: {
          refId: user.id,
          ref: "plugin::users-permissions.user",
          source: "users-permissions",
          field: "thumbnail",
        },
        files: thumbnail,
      });
      if (!result) {
        return ctx.badRequest("Thumbnail upload failed");
      }
    }

    // If no fields were provided, send a bad request response
    if (Object.keys(updates).length === 0) {
      return ctx.badRequest("No fields provided for update");
    }

    // Set the ctx.params and ctx.request.body fields for the strapi update method
    ctx.params = { id: user.id };
    ctx.request.body = updates;

    // Call the strapi update method to update the user
    return await strapi.plugins["users-permissions"]
      .controller("user")
      .update(ctx);
  };

  plugin.controllers.user.changeUserThumbnail = async (ctx) => {
    const user = ctx.state.user;
    // console.log(user);
    if (!user) return ctx.unauthorized();

    // Access the thumbnail file from ctx.request.files instead of ctx.request.body
    const { thumbnail } = ctx.request.files;

    // Create an object to hold the updated fields
    let updates = {};

    if (thumbnail) {
      const result = await strapi.plugins.upload.services.upload.upload({
        data: {
          refId: user.id,
          ref: "plugin::users-permissions.user",
          source: "users-permissions",
          field: "thumbnail",
        },
        files: thumbnail,
      });
      if (!result) {
        return ctx.badRequest("Thumbnail upload failed");
      }
      // Update the thumbnail field in the updates object with the file info from the upload result
      updates.thumbnail = result[0]; // Assuming result is an array of file info objects
    }

    // Set the ctx.params and ctx.request.body fields for the strapi update method
    ctx.params = { id: user.id };
    ctx.request.body = updates;

    // Call the strapi update method to update the user
    return await strapi.plugins["users-permissions"].controllers.user.update(
      ctx
    );
  };

   // plugin.controllers.user.deleteProduct = async (ctx) => {
  //   const { id: productId } = ctx.params;

  //   if (!productId) {
  //     return ctx.badRequest("Product ID is required");
  //   }

  //   try {
  //     // Znalezienie produktu w kolekcji produktów
  //     const product = await strapi.db
  //       .query("product")
  //       .findOne({ where: { id: productId } });

  //     if (!product) {
  //       return ctx.notFound("Product not found");
  //     }

  //     const productName = product.productName; // Pobieranie nazwy produktu

  //     // Znalezienie i usunięcie wpisu produktu z dynamicznej listy na podstawie nazwy produktu
  //     const shoppingListId = 1; // Zakładając, że jest jedna lista zakupów
  //     const existingList = await strapi.entityService.findOne(
  //       "api::shopping-list.shopping-list",
  //       shoppingListId,
  //       {
  //         populate: {
  //           dynamicShoppingList: { populate: ["product", "users"] },
  //         },
  //       }
  //     );

  //     if (existingList) {
  //       const entryIndex = existingList.dynamicShoppingList.findIndex(
  //         (entry) => entry.product && entry.product.productName === productName
  //       );

  //       if (entryIndex !== -1) {
  //         existingList.dynamicShoppingList.splice(entryIndex, 1);
  //         await strapi.entityService.update(
  //           "api::shopping-list.shopping-list",
  //           shoppingListId,
  //           {
  //             data: {
  //               dynamicShoppingList: existingList.dynamicShoppingList,
  //             },
  //           }
  //         );
  //       }
  //     }

  //     // Usunięcie produktu z kolekcji produktów
  //     await strapi.db
  //       .query("product")
  //       .delete({ where: { id: productId } });

  //     return ctx.send({ message: "Product successfully deleted" });
  //   } catch (error) {
  //     return ctx.internalServerError("An error occurred during product deletion");
  //   }
  // };

  plugin.controllers.user.removeUserThumbnail = async (ctx) => {
    // console.log("removeUserThumbnail: Function called");

    const user = ctx.state.user;
    if (!user) {
      // console.log("removeUserThumbnail: No user found in context");
      return ctx.unauthorized("User not authorized");
    }

    const { thumbnailId } = ctx.request.body;
    if (!thumbnailId) {
      // console.log("removeUserThumbnail: Thumbnail ID not provided");
      return ctx.badRequest("Thumbnail ID is required");
    }

    try {
      // console.log(`removeUserThumbnail: Fetching file with ID ${thumbnailId}`);
      const file = await strapi.entityService.findOne(
        "plugin::upload.file",
        thumbnailId
      );

      // console.log(file)

      if (!file) {
        // console.log("removeUserThumbnail: File not found");
        return ctx.notFound("Thumbnail not found");
      }

      // console.log(`removeUserThumbnail: Removing file with ID ${thumbnailId}`);
      await strapi.entityService.delete("plugin::upload.file", thumbnailId);

      // console.log("removeUserThumbnail: Thumbnail successfully deleted");
      return ctx.send({
        message: "Thumbnail successfully deleted",
        status: 200,
      });
    } catch (error) {
      // console.error("removeUserThumbnail Error:", error);
      return ctx.internalServerError("Error occurred while deleting thumbnail");
    }
  };

  plugin.controllers.user.deleteProductColection = async (ctx) => {
    const { id: productId } = ctx.params;

    // console.log(productId);

    if (!productId) {
      return ctx.badRequest("Product ID is required");
    }

    try {
      const product = await strapi.db
        .query("api::product.product")
        .findOne({ where: { id: productId } });

        // console.log(product);

      if (!product) {
        return ctx.notFound("Product not found");
      }

      const productName = product.productName;
      // console.log(productName, 'My consoleLog');

      const shoppingListId = 1;
      const existingList = await strapi.entityService.findOne(
        "api::shopping-list.shopping-list",
        shoppingListId,
        {
          populate: {
            dynamicShoppingList: { populate: ["product", "users"] },
          },
        }
      );

      // console.log(existingList, 'My consoleLog2');

      if (existingList) {
        const entryIndex = existingList.dynamicShoppingList.findIndex(
          (entry) => entry.product && entry.product.productName === productName
        );

        // console.log(entryIndex, 'My consoleLo3');

        if (entryIndex !== -1) {
          existingList.dynamicShoppingList.splice(entryIndex, 1);
          await strapi.entityService.update(
            "api::shopping-list.shopping-list",
            shoppingListId,
            {
              data: {
                dynamicShoppingList: existingList.dynamicShoppingList,
              },
            }
          );
        }
      }

      await strapi.db
        .query("api::product.product")
        .delete({ where: { id: productId } });



      return ctx.send({ message: "Product successfully deleted" });
    } catch (error) {
      return ctx.internalServerError(
        "An error occurred during product deletion"
      );
    }
  };

  // check if user exist base on identifier and if yes return only username and email
  plugin.controllers.user.getUser = async (ctx) => {
    const { identifier } = ctx.query;
    if (!identifier) {
      return ctx.badRequest("Identifier is required");
    }

    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          $or: [{ email: identifier }, { username: identifier }],
        },
        limit: 1,
        fields: ["username", "email"],
      }
    );

    if (!users.length) {
      return ctx.notFound("User not found");
    }

    ctx.status = 200;
    return ctx.send(users[0]);
  };

  // check if user exist base on identifier and if yes return everything <- dangerous for security
  // plugin.controllers.user.getUser = async (ctx) => {
  //   const { identifier } = ctx.query;
  //   if (!identifier) {
  //     return ctx.badRequest("Identifier is required");
  //   }

  //   const users = await strapi.entityService.findMany(
  //     "plugin::users-permissions.user",
  //     {
  //       filters: {
  //         $or: [{ email: identifier }, { username: identifier }],
  //       },
  //       limit: 1,
  //     }
  //   );

  //   if (!users.length) {
  //     return ctx.notFound("User not found");
  //   }

  //   return ctx.send(users[0]);
  // };

  // sent link to reset password
  plugin.controllers.user.forgotPassword = async (ctx) => {
    const { email } = ctx.request.body; // Użycie ctx.request.body zamiast ctx.query
    // console.log(email);
    if (!email) {
      return ctx.badRequest("Email is required");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email } });

    if (!user) {
      return ctx.notFound("User not found");
    }

    const token = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    // const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
    const resetLink = `http://boodschaapapp.vercel.app/auth/reset-password?token=${token}`;

    const emailOptions = {
      to: user.email,
      subject: "BoodschaapApp - Reset your password",
      html: `
      <div style="font-family: Arial, sans-serif; color: #03ffc4; background-color: #000; border: 2px solid #03ffc4; padding: 20px;">
        <h2 style="color: #03ffc4;">Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: #03ffc4;">Reset Password</a>
      </div>
      `,
    };

    try {
      await strapi.plugins.email.services.email.send(emailOptions);
      return ctx.send({ message: "Reset link sent" });
    } catch (error) {
      return ctx.internalServerError("Error sending reset link");
    }
  };




  // sent email to new registered user with confirmation link by email
  // plugin.controllers.user.confirmationLink = async (ctx) => {
  //   const { email} = ctx.request.body;
  //   if (!email) {
  //     return ctx.badRequest("Email is required");
  //   }

  //   const user = await strapi.db
  //     .query("plugin::users-permissions.user")
  //     .findOne({ where: { email } });

  //   if (!user) {
  //     return ctx.notFound("User not found");
  //   }

  //   const token = strapi.plugins["users-permissions"].services.jwt.issue({
  //     id: user.id,
  //   });

  //   const resetLink = `http://localhost:3000/auth/confirmation-link?token=${token}`;
  //   // const resetLink = `http://boodschaapapp.vercel.app/auth/reset-password?token=${token}`;

  //   const emailOptions = {
  //     to: user.email,
  //     subject: "BoodschaapApp - Confirmation Link",
  //     html: `
  //     <div style="font-family: Arial, sans-serif; color: #03ffc4; background-color: #000; border: 2px solid #03ffc4; padding: 20px;">
  //       <h2 style="color: #03ffc4;">Confirmation Link</h2>
  //       <p>Click the link below to confirm account:</p>
  //       <a href="${resetLink}" style="color: #03ffc4;">Confirm</a>
  //     </div>
  //     `,
  //   };

  //   try {
  //     await strapi.plugins.email.services.email.send(emailOptions);
  //     return ctx.send({ message: "Reset link sent" });
  //   } catch (error) {
  //     return ctx.internalServerError("Error sending reset link");
  //   }

  // };


  // confirm new user by reciving the token and update user status to confirmed
  plugin.controllers.user.confirmNewUser= async (ctx) => {
    const { token } = ctx.request.body;
    if (!token) {
      return ctx.badRequest("Token is required");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken); // { id: user_id, ... }

    const id = decodedToken.id;
    // console.log(id);
    // const { id } =
    //   strapi.plugins["users-permissions"].services.jwt.verify(token);

    // console.log(id);

    if (!id) {
      return ctx.badRequest("Invalid token");
    }

    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id },
        data: { authorStatus: "Confirmed" },
      });

    if (!updatedUser) {
      return ctx.internalServerError("Error updating user status");
    }

    return ctx.send({ message: "User confirmed" });
  };






  // get token and password and make function called resetPassword to reset password
  plugin.controllers.user.resetPassword = async (ctx) => {
    const { token, password } = ctx.request.body;
    // console.log(token);
    // console.log(password);
    if (!token || !password) {
      return ctx.badRequest("Token and password are required");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken); // { id: user_id, ... }

    const id = decodedToken.id;
    // console.log(id);
    // const { id } =
    //   strapi.plugins["users-permissions"].services.jwt.verify(token);

    // console.log(id);

    if (!id) {
      return ctx.badRequest("Invalid token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await strapi.db
      .query("plugin::users-permissions.user")
      .update({
        where: { id },
        data: { resetPasswordToken: null, password: hashedPassword },
      });

    if (!updatedUser) {
      return ctx.internalServerError("Error updating password");
    }

    return ctx.send({ message: "Password updated" });
  };


  // check if user is confirmed by providing identifier and if yes return 200 if not return 400 and "user not confirmed"
  plugin.controllers.user.isConfirmed = async (ctx) => {
    const { identifier } = ctx.query;
    if (!identifier) {
      return ctx.badRequest("Identifier is required");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: identifier } });

    if (!user) {
      return ctx.notFound("User not found");
    }

    if (user.authorStatus === "Confirmed") {
      return ctx.send({ message: "User confirmed" });
    }

    return ctx.badRequest("User not confirmed");
  };




  // Add the custom Update me route
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      prefix: "",
    },
  });

  // Add the custom Confirm me route
  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/users/confirm",
    handler: "user.confirmMe",
    config: {
      prefix: "",
    },
  });

  // Add the custom Confirm me route
  // plugin.routes["content-api"].routes.unshift({
  //   method: "PUT",
  //   path: "/users/me/update-favorites",
  //   handler: "user.FavoritesUpdate",
  //   config: {
  //     prefix: "",
  //   },
  // });

  // change user password
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/change-password",
    handler: "user.changePassword",
    config: {
      prefix: "",
    },
  });

  // change user information
  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/users/change-user-info",
    handler: "user.changeUserInfo",
    config: {
      prefix: "",
    },
  });

  // change user information
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/change-user-thumbnail",
    handler: "user.changeUserThumbnail",
    config: {
      prefix: "",
    },
  });

  // plugin.routes["content-api"].routes.unshift({
  //   method: "DELETE",
  //   path: "/products/:id",
  //   handler: "user.deleteProduct",
  //   config: {
  //     prefix: "",
  //   },
  // });

  // remove user thumbnail
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/remove-user-thumbnail",
    handler: "user.removeUserThumbnail",
    config: {
      prefix: "",
    },
  });

  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/products/:id",
    handler: "user.deleteProductColection",
    config: {
      prefix: "",
    },
  });

  // check if user exist base on identifier and if yes return user data
  plugin.routes["content-api"].routes.unshift({
    method: "GET",
    path: "/users/get-user",
    handler: "user.getUser",
    config: {
      prefix: "",
    },
  });

  // sent link to reset password
  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/users/forgot-password",
    handler: "user.forgotPassword",
    config: {
      prefix: "",
    },
  });

  // get token and password and make function called resetPassword to reset password
  plugin.routes["content-api"].routes.unshift({
    method: "POST",
    path: "/users/reset-password",
    handler: "user.resetPassword",
    config: {
      prefix: "",
    },
  });

  // sent email to new registered user with confirmation link by email
  // plugin.routes["content-api"].routes.unshift({
  //   method: "POST",
  //   path: "/users/confirmation-link",
  //   handler: "user.confirmationLink",
  //   config: {
  //     prefix: "",
  //   },
  // });

  // confirm new user by reciving the token and update user status to confirmed
  // plugin.routes["content-api"].routes.unshift({
  //   method: "POST",
  //   path: "/users/confirm-new-use",
  //   handler: "user.confirmNewUser",
  //   config: {
  //     prefix: "",
  //   },
  // });

  // check if user is confirmed by providing identifier and if yes return 200 if not return 400 and "user not confirmed"
  plugin.routes["content-api"].routes.unshift({
    method: "GET",
    path: "/users/is-confirmed",
    handler: "user.isConfirmed",
    config: {
      prefix: "",
    },
  });

  return plugin;
};
