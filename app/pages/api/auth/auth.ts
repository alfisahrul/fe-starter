import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import { getUser } from 'app/db';
import { authConfig } from '@/app/pages/api/auth/auth.config';

const API_URL = 'http://localhost:8080/api/auth/login'; // Adjust to your actual API URL

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const user = await response.json();

        // Handle the response
        if (response.ok && user) {
          return user; // Return user object if authentication is successful
        }

        return null; // Return null if authentication fails
      },
    }),
  ],
});
