'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
  const {id : userId} = policyCtx.state.user;
  const {id : activityId} = policyCtx.request.params;

  const [activity] = await strapi.entityService.findMany('api::activity.activity', {
    filters: { id: activityId },
    populate: { companies : true },
  })
 
  if(!activity?.companies) return false;

  const companyIds = activity.companies.map(company => company.id);
  const [company] = await strapi.entityService.findMany('api::aanbieder.aanbieder', {
    filters: {
      id: { $in : companyIds },
      user: userId
    }
  });

  if (company) return true;
  return false;
};