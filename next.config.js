/*
/** @type {import('next').NextConfig} 
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['aiwaelectronics.com.ar'],
  }
}

module.exports = nextConfig
*/



module.exports = {

  // async rewrites() {
  //   return [
  //     {
  //       source: '/productos/:prod',
  //       destination: '/productos/[prod]',
  //     },
  //   ];
  // },
  async redirects() {
    return [
      {
        source: '/categorias/in-ear/:path*',
        destination: '/categorias/[cat]/:path*',
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },

  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['aiwaelectronics.com.ar', 'www.aiwaelectronics.com.ar'],
    unoptimized: true

  },
  // Agregar la configuración de experiments.topLevelAwait
  // experiments: {
  //   topLevelAwait: true,
  // },

  output: 'standalone',
  trailingSlash: true,
};