/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ucarecdn.com',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
            },
            {
                protocol: 'https',
                hostname: 'wordpress-1345160-4937502.cloudwaysapps.com',
            },
            {
                protocol: 'http',
                hostname: '144.202.50.187:8000'
            }
        ],
    },
}

export default nextConfig
