/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Inclui os PDFs dos guias no pacote da função de download (necessário na Vercel).
  outputFileTracingIncludes: { "/api/guias/[slug]": ["./content/guides-pdf/**"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
