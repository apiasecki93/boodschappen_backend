'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
  const {id : userId} = policyCtx.state.user;
  const {id : treatId} = policyCtx.request.params;

  const [ treat ] = await strapi.entityService.findMany('api::treat.treat', {
    filters: { id: treatId },
    populate: { companies : true },
  })
 
  if(!treat?.companies) return false;

  const companyIds = activity.companies.map(company => company.id);
  const [ company ] = await strapi.entityService.findMany('api::aanbieder.aanbieder', {
    filters: {
      id: { $in : companyIds },
      user: userId
    }
  });

  if (company) return true;
  return false;
};