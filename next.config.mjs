const basePath = process.env.VERCEL ? "" : "/crm-skybridge";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

// cPanel serves the export from /crm-skybridge. Vercel serves the site from
// the domain root, so the same prefix makes CSS and JS 404 there.
if (basePath) {
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath;
}

export default nextConfig;
