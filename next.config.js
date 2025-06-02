/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'dummyjson.com',
      'i.dummyjson.com',
      'cdn.dummyjson.com',
      'localhost'
    ],
    unoptimized: true
  },
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true
}

module.exports = nextConfig 