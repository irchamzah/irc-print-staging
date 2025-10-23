/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    midtransEnvironment: process.env.MIDTRANS_ENVIRONMENT || "sandbox",
    midtransClientKeys: {
      production: "Mid-client-S7IFqCPzEbOVyOrF",
      sandbox: "Mid-client-wPXTxafwqLeUkNQD",
    },
  },
};

export default nextConfig;
