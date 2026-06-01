/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/adapter-pg",
      "pg",
      "bcryptjs",
    ],
  },
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  webpack: (config, { isServer }) => {
    // Map node: protocol to regular node built-ins for webpack
    config.externals = config.externals || [];
    if (typeof config.externals === "function" || !Array.isArray(config.externals)) {
      config.externals = config.externals ? [config.externals] : [];
    }

    const nodeProtocolMap = {
      "node:path": "path",
      "node:os": "os",
      "node:process": "process",
      "node:fs": "fs",
      "node:url": "url",
      "node:crypto": "crypto",
      "node:events": "events",
      "node:stream": "stream",
      "node:buffer": "buffer",
      "node:util": "util",
      "node:net": "net",
      "node:tls": "tls",
    };

    config.externals.push(nodeProtocolMap);

    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        "pg-native": false,
      };
    }

    return config;
  },
};

export default nextConfig;
