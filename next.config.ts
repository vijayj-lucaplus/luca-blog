import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Mongoose ships native/dynamic requires that must not be bundled by the
  // server compiler. Pino is auto-externalized by Next 16, but we list
  // mongoose explicitly to be safe.
  serverExternalPackages: ['mongoose', 'pino'],
  images: {
    // Local SVG covers are served same-origin via /api/cover and rendered
    // with plain <img>, so no remote patterns are required for the MVP.
    // Add entries here if you later source hero photos from a CDN.
    remotePatterns: [],
  },
};

export default nextConfig;
