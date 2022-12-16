'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
 const {id : userId} = policyCtx.state.user;
 const {id : articleId} = policyCtx.request.params;

 strapi.log.info('In is-owner policy.');

 const [article] = await strapi.entityService
    .findMany('api::article.article', {
      filters: {
        id: articleId,
        author: userId
      },
      locale:"all",
    })
  // we have an event owned by the authenticated user
  if (article) {
    return true;
  }

  // we don't have an event owned by the user.
   return false;

};