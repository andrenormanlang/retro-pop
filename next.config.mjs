/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: ['www.superherodb.com'], // Add this line to include your image domain
  },
};

export default nextConfig;
