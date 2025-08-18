import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {},
  images: {
    dangerouslyAllowSVG: true,
  },
};

export default withSentryConfig(nextConfig, { silent: true });
