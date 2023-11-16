'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shopping-list.shopping-list', ({ strapi }) => ({
  async getCategories(ctx) {
    try {
      // Fetch all categories from the database
      const categories = await strapi.entityService.findMany('api::category.category', {
        fields: ['name'], // Specify the fields you want to retrieve, e.g., 'name'
        sort: { name: 'ASC' }, // Optional: sorting the results
      });

      // Return the list of categories
      ctx.body = categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ctx.badRequest('Error fetching categories', { error });
    }
  },
}));
