import redisClient from './redis';

export const storeRefreshToken = async (userId: string, tokenId: string) => {
  const key = `uid:${userId}:tid:${tokenId}`;
  const value = JSON.stringify({
    status: 'active',
    createdAt: new Date().toISOString()
  });

  // Store for 7 days (604800 seconds)
  await redisClient.set(key, value, { EX: 604800 });
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
