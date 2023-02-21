'use strict';

/**
 * aanbieder controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', {

    async createReview(ctx) {
        const { companyId } = ctx.params
        const { id: userId } = ctx.state.user; 
        if (!userId) return ctx.badRequest('Could not find user.', { ok: false });
        
        const existingCompany = await strapi.db.query('api::aanbieder.aanbieder').findOne(companyId);
        if (!existingCompany) return ctx.badRequest('Could not find company.', { ok: false });

        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
            .update('api::review.review', response.data.id, { 
                data: { 
                    user: userId,
                    company: companyId
                } 
            });

        return updatedResponse;
    },

});

