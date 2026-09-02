/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** The dev badge sits over the page in screenshots; QA reads the page, not the badge. */
  devIndicators: false,

  /**
   * Pin the workspace root. Without it Turbopack walks up past the repository,
   * finds an unrelated lockfile in the home directory and warns on every run.
   */
  turbopack: {
    root: import.meta.dirname,
  },

  /**
   * The v1 site was organised around "locations" and "advertisers" and three
   * named audience networks. The two-door model replaces that vocabulary, so
   * the old paths move permanently rather than 404.
   */
  async redirects() {
    return [
      { source: "/locations", destination: "/host", permanent: true },
      { source: "/advertisers", destination: "/advertise", permanent: true },
      { source: "/networks", destination: "/how-it-works", permanent: true },
      { source: "/networks/:slug", destination: "/how-it-works", permanent: true },
    ];
  },
};

export default nextConfig;
