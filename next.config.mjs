/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // يقلل حجم الباندل بتحميل أجزاء من الحزم عند الحاجة
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
