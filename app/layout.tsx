export const metadata = {
  title: "Candlefish AI - Illuminating Intelligence",
  description:
    "Candlefish AI illuminates the path to intelligent business transformation through consciousness-aligned AI consulting.",
  openGraph: {
    title: "Candlefish AI - Illuminating Intelligence",
    description:
      "Where natural wisdom meets artificial intelligence. Guiding businesses through the depths of AI transformation.",
    url: "https://candlefish.ai",
    images: ["https://candlefish.ai/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}