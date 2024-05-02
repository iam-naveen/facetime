import { type GetServerSidePropsContext } from "next";
import {
     User,
     getServerSession,
     type DefaultSession,
     type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
     interface Session extends DefaultSession {
          user: {
               id: string;
               // ...other properties
               // role: UserRole;
          } & DefaultSession["user"];
     }

     // interface User {
     //   // ...other properties
     //   // role: UserRole;
     // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
     callbacks: {
          jwt: async ({ token, user }) => {
               if (user) {
                    token.id = user.id;
               }
               return token;
          },
          session: ({ session, token }) => ({
               ...session,
               user: {
                    ...session.user,
                    id: token.id
               },
          }),
     },
     session: {
          strategy: "jwt",
     },
     providers: [
          CredentialsProvider({
               credentials: {
                    username: { label: "Username", type: "text" },
                    password: { label: "Password", type: "password" },
               },
               async authorize(credentials) {
                    if (!credentials) {
                         return null;
                    }
                    const { username, password } = credentials;
                    const res = await db
                         .select()
                         .from(users)
                         .where(and(eq(users.email, username), eq(users.password, password)))

                    if (res.length === 1) {
                         return res[0] as User;
                    }
                    console.log("Creating user...");
                    const user = await db
                         .insert(users)
                         .values({ id: randomUUID(), email: username, password })
                         .returning();

                    return user[0] as User;
               },
          })
     ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
     req: GetServerSidePropsContext["req"];
     res: GetServerSidePropsContext["res"];
}) => {
     return getServerSession(ctx.req, ctx.res, authOptions);
};

