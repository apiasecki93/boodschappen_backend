'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::article.article');

module.exports = createCoreController('api::article.article', {
    async create(ctx) {
        var { id } = ctx.state.user; //ctx.state.user contains the current authenticated user 
        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
            .update('api::article.article', response.data.id, { data: { author: id } })
        return updatedResponse;
    },
});