#!/bin/sh
set -e

# 从环境变量更新 next.config.mjs
cat > /app/next.config.mjs << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
        GAODE_KEY_CODE: "${GAODE_KEY_CODE}",
        GAODE_SECURITYJS_CODE: "${GAODE_SECURITYJS_CODE}",
    },
    images: {
        domains: [
            'res.liuyuyang.net'
        ],
    },
};

export default nextConfig;
EOF

# 启动应用
exec "$@" 