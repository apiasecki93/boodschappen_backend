module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/shopping-lists/upsert-entry',
      handler: 'shopping-list.upsertEntry',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
