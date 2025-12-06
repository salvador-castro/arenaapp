//C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cmtfqzzhfzymzwyktjhm.supabase.co',
        pathname: '/storage/v1/object/public/uploads/**'
      }
    ]
  },
};

module.exports = nextConfig;
