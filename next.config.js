/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: ['www.konyaspor.org.tr', 'example.com']
  }
}

module.exports = nextConfig 