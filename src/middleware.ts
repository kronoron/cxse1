export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!api|_next|signin|public).*)"],
};


