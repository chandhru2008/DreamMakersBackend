import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { userRoutes } from './user/userRoutes';
import { connectMongo } from './db/mongo';
import { productRoutes } from './product/productRoutes';
import { connectRedis } from './lib/redis';
import { googleRoutes } from './auth/googleRoutes';
import { orderRoutes } from './order/orderRoutes';
dotenv.config();

const init = async (): Promise<void> => {

  await connectRedis();
  
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.route(userRoutes);
  server.route(productRoutes);
  server.route(googleRoutes);
  server.route(orderRoutes);

  await connectMongo();

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
