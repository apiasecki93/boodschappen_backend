'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
 const {id : userId} = policyCtx.state.user;
 const {id : companyId} = policyCtx.request.params;

 const [company] = await strapi.entityService
    .findMany('api::aanbieder.aanbieder', {
      filters: {
        id: companyId,
        user: userId
      }
    })
  // we have an event owned by the authenticated user
  if (company) {
    return true;
  }

  // we don't have an event owned by the user.
   return false;

};