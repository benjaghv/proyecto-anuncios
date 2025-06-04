/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  api: {
    runtime: 'nodejs'
  }
}

module.exports = nextConfig 