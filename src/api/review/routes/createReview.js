'use strict';

/**
 * aanbieder router
 */

 module.exports = {
  routes: [
    { 
      method: 'POST',
      path: '/reviews/:companyId', 
      handler: 'review.createReview',
    },
  ]
}