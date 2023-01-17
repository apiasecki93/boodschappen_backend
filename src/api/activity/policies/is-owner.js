'use strict';
/**
 * `is-owner` policy.
 */
module.exports = async (policyCtx, config, {strapi}) => {
 const {id : userId} = policyCtx.state.user;
 const {id : activityId} = policyCtx.request.params;

 const [activity] = await strapi.entityService.findMany('api::activity.activity', {
   filters: {
     id: activityId,
   },
   populate: { company : true },
 })

 if(activity?.company){
  const [company] = await strapi.entityService.findMany('api::aanbieder.aanbieder', {
    filters: {
      id: activity?.company?.id,
      user: userId
    }
  })
  if (company) {
    return true;
  }
 }

  // we don't have an event owned by the user.
   return false;

};