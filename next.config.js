/** @type {import('next/dist/next-types').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
    ]
  },
  // Other config options...
}

module.exports = nextConfig
