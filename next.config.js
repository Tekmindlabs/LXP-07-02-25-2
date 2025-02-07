/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    // Native module handling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false
      };
    }

    // PDF.js worker configuration
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]'
      }
    });

    // Improved .node file handling
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: 'node-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      ],
      include: [
        /node_modules\/@lancedb\/lancedb-win32-x64-msvc/
      ]
    });

    // Ensure .node files are treated as binary modules
    config.module.rules.push({
      test: /\.node$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name][ext]'
      }
    });

    // Add externals for native modules
    if (!isServer) {
      config.externals = [
        ...config.externals || [],
        { 
          '@lancedb/lancedb-win32-x64-msvc': 'commonjs @lancedb/lancedb-win32-x64-msvc',
          '@lancedb/lancedb': 'commonjs @lancedb/lancedb'
        }
      ];
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true
    };

    return config;
  }
};

module.exports = nextConfig;



