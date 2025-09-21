// next.config.ts
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    const config: NextConfig = {
        webpack(webpackConfig) {
            webpackConfig.module?.rules?.push({
                test: /\.svg$/,
                use: ["@svgr/webpack"],
            });
            return webpackConfig;
        },
    };

    if (isDev) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        // during `next dev`, proxy /be/* -> http://localhost:8080/*
        config.rewrites = async () => [
            { source: "/be/:path*", destination: `${backendUrl}/:path*`, },
        ];
    }

    return config;
};

export default nextConfig;