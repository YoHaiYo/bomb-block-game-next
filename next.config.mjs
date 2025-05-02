/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // 환경 변수 전달
  },
};

export default nextConfig;
