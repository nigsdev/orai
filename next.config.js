const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle async storage for web - use our mock module
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'lib/async-storage-mock.js'),
    };

    // Handle handlebars issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'handlebars': false,
    };

    return config;
  },
  // Exclude the hedera-agent-kit-js folder from compilation
  experimental: {
    externalDir: true,
  },
}

module.exports = nextConfig
