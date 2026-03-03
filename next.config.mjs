/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VPS_API_URL: process.env.VPS_API_URL,
  },
};

export default nextConfig;
