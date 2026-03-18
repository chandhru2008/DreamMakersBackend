import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { userRoutes } from './user/userRoutes.js';
import { connectMongo } from './db/mongo.js';
import { productRoutes } from './product/productRoutes.js';
import { connectRedis } from './lib/redis.js';
import { googleRoutes } from './auth/googleRoutes.js';
import { orderRoutes } from './order/orderRoutes.js';
import { wishlistRoutes } from './wishlist/wishlistRoutes.js';
import { setupJwtAuth } from './auth/jwt.js';
dotenv.config();

const init = async (): Promise<void> => {
  await connectRedis();

  const isDev = process.env.NODE_ENV === 'development';

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: isDev ? 'localhost' : '0.0.0.0',
  });

  await setupJwtAuth(server);

  server.route(userRoutes);
  server.route(productRoutes);
  server.route(googleRoutes);
  server.route(orderRoutes);
  server.route(wishlistRoutes);

  await connectMongo();

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
