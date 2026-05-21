import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Required for Docker / Railway — produces .next/standalone for the runner stage.
  output: "standalone",

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
