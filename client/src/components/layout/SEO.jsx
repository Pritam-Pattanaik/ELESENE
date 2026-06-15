import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description = "ELESENE - Next-Gen Women's Fashion E-Commerce. Curating contemporary global aesthetics for the modern modern woman.", 
  type = 'website',
  name = 'ELESENE',
  image = 'https://elesene.com/og-image.jpg', // Placeholder
  url = 'https://elesene.com/' 
}) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | ${name}` : name}</title>
      <meta name='description' content={description} />
      
      {/* End of standard metadata tags */}
      
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title ? `${title} | ${name}` : name} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${name}` : name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
