/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local assets only in Phase 1; no remote loaders required.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
