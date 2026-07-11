/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL === 'http://localhost:5000/api')
      ? 'https://asp-cranes-9-july-26.vercel.app/api'
      : process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
        ? 'https://asp-cranes-9-july-26.vercel.app/api'
        : 'http://localhost:5000/api'),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
       {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
      protocol: 'https',
      hostname: 'placehold.co',
    },
    {
        protocol: 'http',
        hostname: '**', // Matches all hostnames over HTTP
      },
      {
        protocol: 'https',
        hostname: '**', // Matches all hostnames over HTTPS
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
