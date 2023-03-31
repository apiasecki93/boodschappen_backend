'use strict';

/**
 * treat service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::treat.treat');
