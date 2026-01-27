const nextPWA = require("@ducanh2912/next-pwa").default

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cmtfqzzhfzymzwyktjhm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // 👇 esto es CLAVE
  experimental: {
    turbo: false,
  },
}

module.exports = withPWA(nextConfig)
