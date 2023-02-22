'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
 const {id : userId} = policyCtx.state.user;
 const {id : reviewId} = policyCtx.request.params;

 const [review] = await strapi.entityService
    .findMany('api::review.review', {
      filters: {
        id: reviewId,
        user: userId
      }
    })
  // we have an event owned by the authenticated user
  if (review) {
    return true;
  }

  // we don't have an event owned by the user.
   return false;

};