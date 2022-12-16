'use strict';

/**
 * loginpage service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::loginpage.loginpage');
