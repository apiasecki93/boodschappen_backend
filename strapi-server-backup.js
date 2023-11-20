const _ = require("lodash");
8;
// const { parseMultipartData } = require("@strapi/utils");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

module.exports = (plugin) => {
  //UPDATE ME CONTROLLER


  plugin.controllers.user.updateMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    console.log(ctx.request.body);
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
  //       .  ("plugin::users-permissions.user")
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
    const user = ctx.state.user;
    // console.log(user);
    if (!user) return ctx.unauthorized();
    // console.log(ctx.request.body);
    const { username, email, firstname, lastname, thumbnail } = ctx.request.body;
    // console.log(lastname);
    // Create an object to hold the updated fields
    let updates = {};
  
    // Check each field to see if it was provided, and if so, add it to the updates object
    if (username) updates.username = username;
    if (email) updates.email = email;
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
    return await strapi.plugins['users-permissions'].controller('user').update(ctx);
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
        updates.thumbnail = result[0];  // Assuming result is an array of file info objects
    }

    // Set the ctx.params and ctx.request.body fields for the strapi update method
    ctx.params = { id: user.id };
    ctx.request.body = updates;

    // Call the strapi update method to update the user
    return await strapi.plugins['users-permissions'].controllers.user.update(ctx);
}

plugin.controllers.user.deleteProduct = async (ctx) => {
  const { id: productId } = ctx.params;
  
  if (!productId) {
    return ctx.badRequest("Product ID is required");
  }

  try {
    const product = await strapi.db
      .query("product")
      .findOne({ where: { id: productId } });

    if (!product) {
      return ctx.notFound("Product not found");
    }

    await strapi.db
      .query("product")
      .delete({ where: { id: productId } });

    return ctx.send({ message: "Product successfully deleted" });
  } catch (error) {
    console.error(`Error in deleteProduct: ${error.message}`);
    return ctx.internalServerError("An error occurred during product deletion");
  }
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
    method: "PUT",
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


  plugin.routes["content-api"].routes.unshift({
    method: "DELETE",
    path: "/products/:id",
    handler: "user.deleteProduct",
    config: {
      prefix: "",
    },
  });
  



  return plugin;
};
