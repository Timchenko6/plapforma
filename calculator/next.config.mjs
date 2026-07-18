/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Site is served from https://timchenko6.github.io/plapforma/calc/
  basePath: '/plapforma/calc',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
