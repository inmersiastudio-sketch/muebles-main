import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el entorno de desarrollo desde teléfonos y tablets de la LAN.
  allowedDevOrigins: ["192.168.1.157"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com", // Used for faker/seed data if any
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
