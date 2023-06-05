const _ = require('lodash');
const { parseMultipartData} = require('@strapi/utils');

module.exports = (plugin) => {

  //UPDATE ME CONTROLLER
  plugin.controllers.user.updateMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);
        ctx.request.body = _.pick(data, ['firstname', 'lastname']);
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
        if(result){
          return await strapi.plugins['users-permissions'].controller('user').update(ctx);
        }
    }

    // Pick only specific fields for security
    ctx.request.body = _.pick(ctx.request.body, ['firstname', 'lastname']);
    ctx.params = { id: user.id };
    return await strapi.plugins['users-permissions'].controller('user').update(ctx);
  };

  //CONFIRM ME CONTROLLER
  plugin.controllers.user.confirmMe = async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const entry = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id }
    })

    if (!entry) return ctx.badRequest('Could not find user', { ok: false });
    if (entry.authorStatus == 'Confirmed') return ctx.badRequest('User already confirmed', { ok: false });
    if (entry.authorStatus == 'Requested confirmation') return ctx.badRequest('User confirmation already pending', { ok: false });
    if(!entry.authorStatus || entry.authorStatus == 'None'){
        ctx.params = { id: user.id };
        ctx.request.body = { 
            authorStatus : 'Requested confirmation'
        }
        return await strapi.plugins['users-permissions'].controller('user').update(ctx);
    }
    return ctx.badRequest('Unknown error', { ok: false })
  };


  //ADD FAVORITE CONTROLLER
  plugin.controllers.user.UpdateFavorites = async (ctx) => {
    const { id: userId } = ctx.state.user; 
    if (!userId) return ctx.unauthorized();

    const newFavorites = ctx.request.body?.data?.favorites
    if(newFavorites && Array.isArray(newFavorites)){
      ctx.params = { id: userId };
      ctx.request.body = { 
          favorites : newFavorites
      };
  
      return await strapi.plugins['users-permissions'].controller('user').update(ctx);
    }

    return ctx.badRequest('Favorites needs to be an array', { ok: false });
  };


  // Add the custom Update me route
  plugin.routes['content-api'].routes.unshift({
    method: 'PUT',
    path: '/users/me',
    handler: 'user.updateMe',
    config: {
      prefix: ''
    }
  });

  // Add the custom Confirm me route
  plugin.routes['content-api'].routes.unshift({
    method: 'POST',
    path: '/users/confirm',
    handler: 'user.confirmMe',
    config: {
      prefix: ''
    }
  });

  // Add the custom Confirm me route
  plugin.routes['content-api'].routes.unshift({
    method: 'PUT',
    path: '/users/me/favorites',
    handler: 'user.UpdateFavorites',
    config: {
      prefix: ''
    }
  });

  return plugin;
};