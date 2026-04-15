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
  description = "GAKHA - Modern Terrace Wear & Indonesian Football Culture. Koleksi streetwear premium yang terinspirasi dari semangat supporter dan budaya stadion.", 
  keywords = "streetwear indonesia, terrace wear, football culture, gakha, apparel supporter, fashion stadion", 
  image = "/logo.png",
  url = "https://gakha.store"
}: SEOProps) {
  const siteTitle = "GAKHA";
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} | Modern Terrace Wear`;

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
