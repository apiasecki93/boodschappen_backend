'use strict';

/**
 * treat router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::treat.treat', {
    config: {
      update: {
          "policies" : ["is-owner"]
      },
      delete: {
          "policies" : ["is-owner"]
      },
    }
});
