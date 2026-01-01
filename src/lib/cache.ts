import redisClient from './redis';

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};
