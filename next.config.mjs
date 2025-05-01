/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  basePath: isProd ? '/ricart-agrawala' : '',
  assetPrefix: isProd ? '/ricart-agrawala/' : '',
  trailingSlash: true,
};

export default nextConfig;
