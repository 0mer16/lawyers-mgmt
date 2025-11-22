/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-auth'],
  webpack: (config) => {
    // Handle next-auth module resolution properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      dns: false,
      tls: false,
    };

    return config;
  },
}

module.exports = nextConfig 