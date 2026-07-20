import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Docker deploy üçün. `.next/standalone` altında yalnız lazım olan faylları və minimal
   * `server.js`-i yığır — image-də `node_modules` daşımağa ehtiyac qalmır.
   *
   * `public` və `.next/static` bura avtomatik kopyalanmır; onları Dockerfile əl ilə köçürür.
   */
  output: "standalone",
};

export default nextConfig;
