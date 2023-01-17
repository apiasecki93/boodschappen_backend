'use strict';

/**
 * activity router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::activity.activity', {
    config: {
      update: {
          "policies" : ["is-owner"]
      },
      delete: {
          "policies" : ["is-owner"]
      },
    }
  });