'use strict';

/**
 * treat controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::treat.treat', {
    async create(ctx) {
        var { id } = ctx.state.user; //ctx.state.user contains the current authenticated user 
        const userCompany = await strapi.db.query('api::aanbieder.aanbieder').findOne({ where: { user: id }});
        if (!userCompany) return ctx.badRequest('Company does not exists for user. Create a company first', { ok: false });
        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
            .update('api::treat.treat', response.data.id, { data: { companies: userCompany.id } });
        return updatedResponse;
    }
});