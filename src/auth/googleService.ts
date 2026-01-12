// src/auth/googleService.ts
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleIdToken = async (idToken: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
  }
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) {
    throw new Error('Invalid Google ID token');
  }

  return {
    email: payload.email,
    name: payload.name,
    googleId: payload.sub,
  };
};
