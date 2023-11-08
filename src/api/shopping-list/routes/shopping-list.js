module.exports = {
  routes: [
    {
      method: "POST",
      path: "/shopping-lists/upsert-entry",
      handler: "shopping-list.upsertEntry",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/shopping-lists",
      handler: "shopping-list.findAll",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/shopping-lists/reduce-product-quantity",
      handler: "shopping-list.reduceProductQuantity",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
