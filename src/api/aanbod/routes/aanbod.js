'use strict';

/**
 * aanbod router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::aanbod.aanbod', {
    config: {
      update: {
          "policies" : ["is-owner"]
      },
      delete: {
          "policies" : ["is-owner"]
      },
    }
  });
