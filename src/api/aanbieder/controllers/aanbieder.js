'use strict';

/**
 * aanbieder controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { convertRestQueryParams, buildQuery } = require('@strapi/utils');

// module.exports = createCoreController('api::aanbieder.aanbieder');

module.exports = createCoreController('api::aanbieder.aanbieder', {
    async create(ctx) {
        var { id } = ctx.state.user; //ctx.state.user contains the current authenticated user 
        if (!id) return ctx.badRequest('Could not find user.', { ok: false });
        const entry = await strapi.db.query('api::aanbieder.aanbieder').findOne({ where: { user: id }})
        if (entry) return ctx.badRequest('Company already exists for user. Edit existing company instead', { ok: false });
        const response = await super.create(ctx);
        const updatedResponse = await strapi.entityService
            .update('api::aanbieder.aanbieder', response.data.id, { data: { user: id } })
        return updatedResponse;
    },
    
    async deleteThumbnail(ctx) {
        var { id } = ctx.state.user; //ctx.state.user contains the current authenticated user 
        if (!id) return ctx.badRequest('Could not find user.', { ok: false });

        const entry = await strapi.db.query('api::aanbieder.aanbieder').findOne({ 
            where: { user: id },
            populate: { thumbnail: true },
        });
        if (!entry) return ctx.badRequest('Could not find company.', { ok: false });

        const thumbnailId = entry?.thumbnail?.id;
        if (!thumbnailId) return ctx.badRequest('Could not find company thumbnail.', { ok: false });

        const imageEntry = await strapi.db.query('plugin::upload.file').delete({ where: { id: thumbnailId }});
        strapi.plugins.upload.services.upload.remove(imageEntry);
        ctx.send({ message: 'the thumbnail was deleted'}, 200);
    },

    async deleteImage(ctx) {
        var { imageId } = ctx.params
        var { id:userId } = ctx.state.user; //ctx.state.user contains the current authenticated user 
        if (!userId) return ctx.badRequest('Could not find user.', { ok: false });

        const entry = await strapi.db.query('api::aanbieder.aanbieder').findOne({ 
            where: { user: userId },
            populate: { images: true },
        });
        if (!entry) return ctx.badRequest('Could not find company.', { ok: false });

        const imageIdIsValid = entry.images.filter((image) => image.id == imageId).length? true : false;
        if (!imageIdIsValid) return ctx.badRequest('Could not find image for company.', { ok: false });
        
        const imageEntry = await strapi.db.query('plugin::upload.file').delete({ where: { id: imageId }});
        strapi.plugins.upload.services.upload.remove(imageEntry);
        ctx.send({ message: 'the image was deleted'}, 200);
    },
});

