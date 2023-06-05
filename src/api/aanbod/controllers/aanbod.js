'use strict';

/**
 * aanbod controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::aanbod.aanbod', {
    async create(ctx) {
        var { id } = ctx.state.user;
        const userCompany = await strapi.db.query('api::aanbieder.aanbieder').findOne({ where: { user: id }});
        if (!userCompany) return ctx.badRequest('Company does not exists for user. Create a company first', { ok: false });
        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
            .update('api::aanbod.aanbod', response.data.id, { data: { company: userCompany.id } });
        return updatedResponse;
    }
});
