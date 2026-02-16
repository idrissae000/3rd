/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep this minimal; add options only if you need them
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
