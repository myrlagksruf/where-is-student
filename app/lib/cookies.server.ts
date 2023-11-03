import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const hanAuth = createCookie("han-auth", {
  secrets:[process.env.SALT7 ?? ''],
  maxAge: 21600, // 6hours
});