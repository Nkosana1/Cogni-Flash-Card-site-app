import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Master anything with NeuroFlash - Spaced repetition flashcards that help you remember information 3x longer" />
        <meta name="keywords" content="flashcards, spaced repetition, learning, study, memory, education" />
        <meta name="author" content="NeuroFlash" />
        <meta property="og:title" content="NeuroFlash - Master Anything with Spaced Repetition" />
        <meta property="og:description" content="Remember information 3x longer with our scientifically-proven spaced repetition algorithm" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

