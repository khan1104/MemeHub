// import { Domain } from "domain";
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   images: {
//     domains: [
//       'terpdfhqqmambcxoyrxn.supabase.co',
//       'lh3.googleusercontent.com'
//     ],
//   },
// };

// export default nextConfig;

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'terpdfhqqmambcxoyrxn.supabase.co',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**'
            }
        ]
    }
};

module.exports = nextConfig;
