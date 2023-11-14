module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  app: {
    keys: env.array("APP_KEYS"),
  },
  url: env('', 'http://localhost:1338'),
});

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  app: {
        keys: env.array("APP_KEYS"),
      },
  url: env('PUBLIC_URL', 'http://localhost:1338'), // update this line
  settings: {
    cors: {
      enabled: true,
      origin: ['http://localhost:3000'], // update this line
      headers: '*', // Optional: you might want to specify headers
    },
  },
});
