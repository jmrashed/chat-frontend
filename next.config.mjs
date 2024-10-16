/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_URL: process.env.NEXT_APP_URL,
    API_URL: process.env.API_URL,
    SOCKET_API_URL: process.env.SOCKET_API_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ENCODER_SECRET: process.env.NEXT_APP_ENCODER_SECRET,
  },
  output: 'standalone', // Ensure you want this option for your deployment
  images: {
    domains: [
      'localhost', // Add your localhost for local development
      'example.com', // Replace with your actual domain(s) for production
      // Add any other domains you want to allow images from
    ],
  },
};

export default nextConfig;
