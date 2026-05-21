import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/server/db/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session({ session, user }) {
      // Expose the database user id on the session so server code can use it
      if (user?.id) session.user.id = user.id
      return session
    },
  },
})
