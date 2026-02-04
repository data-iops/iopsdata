const requiredEnv = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (process.env.NODE_ENV === "production" && missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}. ` +
      "Set them in your deployment environment."
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: [
      "images.unsplash.com",
      "avatars.githubusercontent.com",
      "cdn.jsdelivr.net",
      "lh3.googleusercontent.com",
    ],
  },
};

module.exports = nextConfig;
