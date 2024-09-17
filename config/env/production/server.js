module.exports = ({ env }) => ({
  host: env('HOST'),
  port: env.int('PORT'),
  url: env('BACKEND_RAILWAY_URL'),
});
