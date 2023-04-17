'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
  const {id : userId} = policyCtx.state.user;
  const {id : decorationId} = policyCtx.request.params;

  const [ decoration ] = await strapi.entityService.findMany('api::decoration.decoration', {
    filters: { id: decorationId },
    populate: { companies : true },
  })
 
  if(!decoration?.companies) return false;

  const companyIds = decoration.companies.map(company => company.id);
  const [ company ] = await strapi.entityService.findMany('api::aanbieder.aanbieder', {
    filters: {
      id: { $in : companyIds },
      user: userId
    }
  });

  if (company) return true;
  return false;
};