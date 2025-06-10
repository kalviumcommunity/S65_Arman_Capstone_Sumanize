import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware(req) {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      if (pathname.startsWith("/auth/")) {
        return true;
      }

      if (pathname.startsWith("/api/auth/")) {
        return true;
      }

      const protectedRoutes = [
        "/dashboard",
        "/account",
        "/chat",
        "/premium",
        "/settings",
      ];

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isProtectedRoute) {
        return !!token;
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
