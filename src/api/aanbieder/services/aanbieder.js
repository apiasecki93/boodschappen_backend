'use strict';

/**
 * aanbieder service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::aanbieder.aanbieder');
