const _ = require("lodash");
8;
const { parseMultipartData } = require("@strapi/utils");

module.exports = (plugin) => {
  //UPDATE ME CONTROLLER
  plugin.controllers.user.updateMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
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
  plugin.controllers.user.UpdateFavorites = async (ctx) => {
    const { id: userId } = ctx.state.user;
    if (!userId) return ctx.unauthorized();

    const newFavorites = ctx.request.body?.data?.favorites;
    if (newFavorites && Array.isArray(newFavorites)) {
      ctx.params = { id: userId };
      ctx.request.body = {
        favorites: newFavorites,
      };

      return await strapi.plugins["users-permissions"]
        .controller("user")
        .update(ctx);
    }

    return ctx.badRequest("Favorites needs to be an array", { ok: false });
  };

  plugin.controllers.user.toggleFavorite = async (ctx) => {
    try {
      const userId = ctx.state.user.id;
      const { productId } = ctx.request.body;

      if (!productId) {
        return ctx.badRequest("Product ID is missing");
      }

      // Fetch user and their favorites
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        { populate: ["favorites"] }
      );

      if (!user) {
        return ctx.notFound("User not found");
      }

      const alreadyFavorited = user.favorites.some(
        (fav) => fav.id == productId
      );

      //  conosole all variables
      console.log(user);
      console.log(userId);
      console.log(productId);
      console.log(ctx.request.body);
      console.log(alreadyFavorited);

      let updatedFavoritesIds;
      if (alreadyFavorited) {
        updatedFavoritesIds = user.favorites
          .map((fav) => fav.id)
          .filter((id) => id !== productId);
      } else {
        updatedFavoritesIds = [
          ...user.favorites.map((fav) => fav.id),
          productId,
        ];
      }

      // Direct database update
      await strapi.entityService.update(
        { id: userId, model: "plugin::users-permissions.user" },
        { favorites: updatedFavoritesIds }
      );

      // Fetch the updated user to return
      const updatedUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        { populate: ["favorites"] }
      );

      return ctx.send(updatedUser);
    } catch (error) {
      strapi.log.error(`Error in toggleFavorite: ${error.message}`);
      return ctx.internalServerError("An error occurred");
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
  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me/favorites",
    handler: "user.toggleFavorite",
    config: {
      prefix: "",
    },
  });

  return plugin;
};
