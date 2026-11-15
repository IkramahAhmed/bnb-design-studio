import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Build plain HTML, CSS and JS files into `out/`. Upload that folder to Hostinger: no Node server needed.
  output: 'export',
  // `/privacy/` -> privacy/index.html, which every shared host serves without extra rules.
  trailingSlash: true,
  // The built-in image optimiser needs a server. Images here are small and sized by hand.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
