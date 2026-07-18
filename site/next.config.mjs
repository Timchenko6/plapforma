/** @type {import('next').NextConfig} */
const basePath = '/plapforma/new';

const nextConfig = {
  output: 'export',
  // Served from https://timchenko6.github.io/plapforma/new/ until domain swap
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
