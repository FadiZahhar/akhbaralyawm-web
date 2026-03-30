import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
      },
      {
        protocol: "https",
        hostname: "www.akhbaralyawm.com",
      },
      {
        protocol: "https",
        hostname: "akhbaralyawm.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/Default.aspx",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/Mix.aspx",
        destination: "/mix",
        permanent: true,
      },
      {
        source: "/tag/:term",
        destination: "/search?q=:term",
        permanent: true,
      },
      {
        source: "/news/:id(\\d+)/:legacySlug",
        destination: "/news/:id",
        permanent: true,
      },
      {
        source: "/Newsdet.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<id>\\d+)",
          },
        ],
        destination: "/news/:id",
        permanent: true,
      },
      {
        source: "/News.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<slugOrId>[^&]+)",
          },
        ],
        destination: "/category/:slugOrId",
        permanent: true,
      },
      {
        source: "/Author.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<slugOrId>[^&]+)",
          },
        ],
        destination: "/author/:slugOrId",
        permanent: true,
      },
      {
        source: "/Search.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<term>[^&]+)",
          },
        ],
        destination: "/search?q=:term",
        permanent: true,
      },
      {
        source: "/Read.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "1",
          },
        ],
        destination: "/about",
        permanent: true,
      },
      {
        source: "/Read.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "2",
          },
        ],
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/Read.aspx",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<id>\\d+)",
          },
        ],
        destination: "/read/:id",
        permanent: true,
      },
      {
        source: "/read/1",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/read/2",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
