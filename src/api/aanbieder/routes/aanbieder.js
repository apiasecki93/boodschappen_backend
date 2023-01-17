'use strict';

/**
 * aanbieder router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::aanbieder.aanbieder', {
    config: {
      update: {
          "policies" : ["is-owner"]
      },
      delete: {
          "policies" : ["is-owner"]
      },
      deleteThumbnail: {
        "policies" : ["is-owner"]
      },
      deleteImage: {
        "policies" : ["is-owner"]
      },
    }
  });