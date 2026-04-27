/** @type {import('next').NextConfig} */
const isCapacitor = process.env.CAPACITOR_BUILD === "true";

const nextConfig = {
  ...(isCapacitor && { output: "export" }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
