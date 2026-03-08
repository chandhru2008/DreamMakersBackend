import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { userRoutes } from './user/userRoutes.ts';
import { connectMongo } from './db/mongo.ts';
import { productRoutes } from './product/productRoutes.ts';
import { connectRedis } from './lib/redis.ts';
import { googleRoutes } from './auth/googleRoutes.ts';
import { orderRoutes } from './order/orderRoutes.ts';
import { wishlistRoutes } from './wishlist/wishlistRoutes.ts';
import { setupJwtAuth } from './auth/jwt.ts';
dotenv.config();

const init = async (): Promise<void> => {

  await connectRedis();

  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await setupJwtAuth(server)

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
