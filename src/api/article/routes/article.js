'use strict';

/**
 * article router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::article.article', {
    config: {
      update: {
          "policies" : ["is-owner"]
      },
      delete: {
          "policies" : ["is-owner"]
      }
    }
  });