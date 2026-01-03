import { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

/**
 * Dynamic Metadata Generator for Profile Pages
 *
 * Fetches user information to provide SEO and Social Media previews (OG/Twitter)
 * specific to the creator being viewed.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  // Basic fallback metadata
  const title = `@${username} on Arc Caffeine ☕`;
  const description = `Support @${username}'s creative journey with USDC donations and mint unique Supporter NFTs on Arc Testnet.`;
  const url = `https://arccaffeine.xyz/${username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Arc Caffeine",
      type: "profile",
      images: [
        {
          url: "https://arccaffeine.xyz/og-image.png", // Fallback to main OG image
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://arccaffeine.xyz/og-image.png"],
    },
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
