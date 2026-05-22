import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
