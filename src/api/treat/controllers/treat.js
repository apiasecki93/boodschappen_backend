'use strict';

/**
 * treat controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::treat.treat');
