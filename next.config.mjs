/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		missingSuspenseWithCSRBailout: false,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "okepievzdelqzjwhsueu.supabase.co",
				pathname: "/storage/v1/object/sign/avatars/**",
			},
			{
				protocol: "https",
				hostname: "www.superherodb.com",
				pathname: "/**",
			},
		],
	},
	reactStrictMode: true,
};

export default nextConfig;
