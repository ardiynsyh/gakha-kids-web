import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEO({ 
  title, 
  description = "Gakha Kids - Spesialis fashion bayi dan balita premium. Pakaian berkualitas tinggi, lembut, dan modern untuk buah hati Anda.", 
  keywords = "pakaian bayi, baju balita, fashion bayi premium, gakha kids, perlengkapan bayi modern", 
  image = "/logo.png",
  url = "https://gakhakids.online"
}: SEOProps) {
  const siteTitle = "Gakha Kids";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Pakaian Anak Premium`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
