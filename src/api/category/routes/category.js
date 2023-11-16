module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/category',
     handler: 'category.getCategories',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
