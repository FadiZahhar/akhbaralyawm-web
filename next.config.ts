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
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/Default.aspx",
        destination: "/ar",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/ar/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/ar/contact",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/ar/about",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/ar/contact",
        permanent: true,
      },
      {
        source: "/mix",
        destination: "/ar/mix",
        permanent: true,
      },
      {
        source: "/Mix.aspx",
        destination: "/ar/mix",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/ar/search",
        permanent: true,
      },
      {
        source: "/tag/:term",
        destination: "/ar/search?q=:term",
        permanent: true,
      },
      {
        source: "/news/:id(\\d+)/:legacySlug",
        destination: "/ar/news/:id",
        permanent: true,
      },
      {
        source: "/news/:slugId",
        destination: "/ar/news/:slugId",
        permanent: true,
      },
      {
        source: "/category/:slug",
        destination: "/ar/category/:slug",
        permanent: true,
      },
      {
        source: "/author/:slug",
        destination: "/ar/author/:slug",
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
        destination: "/ar/news/:id",
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
        destination: "/ar/category/:slugOrId",
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
        destination: "/ar/author/:slugOrId",
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
        destination: "/ar/search?q=:term",
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
        destination: "/ar/about",
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
        destination: "/ar/contact",
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
        destination: "/ar/read/:id",
        permanent: true,
      },
      {
        source: "/read/1",
        destination: "/ar/about",
        permanent: true,
      },
      {
        source: "/read/2",
        destination: "/ar/contact",
        permanent: true,
      },
      {
        source: "/read/:id",
        destination: "/ar/read/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
