import redisClient from './redis';

export const storeRefreshToken = async (
  userId: string,
  tokenId: string
) => {
  const key = `refresh:${userId}:${tokenId}`;
  await redisClient.set(key, 'valid', { EX: 7 * 24 * 60 * 60 });
};

export const isRefreshTokenValid = async (
  userId: string,
  tokenId: string
) => {
  const key = `refresh:${userId}:${tokenId}`;
  return Boolean(await redisClient.get(key));
};

export const revokeRefreshToken = async (
  userId: string,
  tokenId: string
) => {
  const key = `refresh:${userId}:${tokenId}`;
  await redisClient.del(key);
};

export const revokeAllUserTokens = async (userId: string) => {
  const keys = await redisClient.keys(`refresh:${userId}:*`);
  if (keys.length) {
    await redisClient.del(keys);
  }
};
