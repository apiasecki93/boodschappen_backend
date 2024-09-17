module.exports = ({ env }) => ({
    'users-permissions': {
      config: {
      jwtSecret: env('JWT_SECRET'),
      },
    },
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      },
    },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST', 'smtp.example.com'),
          port: env('SMTP_PORT', 587),
          auth: {
            user: env('SMTP_USERNAME'),
            pass: env('SMTP_PASSWORD'),
          },
          secure: true,
          name: "boodschaapapp.vercel.app",
          requireTLS: true,
          tls: {
          ciphers: 'SSLv3'
        },
        },
        settings: {
          defaultFrom: 'apiasecki93@gmail.com',
          defaultReplyTo: 'apiasecki93@gmail.com',
          // baseUrl: env('FRONTEND_URL', 'http://localhost:3000'),
        },
      },
    },
  });
