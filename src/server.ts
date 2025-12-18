import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { userRoutes } from './user/userRoutes';
import { connectMongo } from './db/mongo';

dotenv.config();

const init = async (): Promise<void> => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.route(userRoutes);

  await connectMongo();

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
