import Hapi from '@hapi/hapi';
import { userRoutes } from './User/userRoutes';

const init = async (): Promise<void> => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.route(userRoutes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
