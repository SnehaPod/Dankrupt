import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // `output: "standalone"` is only for self-hosted / Docker deployments.
  // Vercel manages its own bundling — do not set it here.

  async redirects() {
    return [
      // Root → trending (handled at the CDN/routing level before page rendering)
      {
        source: "/",
        destination: "/trending",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
