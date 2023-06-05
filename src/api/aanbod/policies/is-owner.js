'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
  const {id : userId} = policyCtx.state.user;
  const {id : aanbodId} = policyCtx.request.params;

  const [ aanbod ] = await strapi.entityService.findMany('api::aanbod.aanbod', {
    filters: { id: aanbodId },
    populate: { aanbieder : true },
  })
 
  if(!aanbod?.aanbieder?.id) return false;

  const [company] = await strapi.entityService.findMany('api::aanbieder.aanbieder', {
    filters: {
      id: aanbod.aanbieder.id,
      user: userId
    }
  });

  if (company) return true;
  return false;
};