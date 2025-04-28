import type { AppProps } from 'next/app';
import { AppConfigProvider } from '../contexts/AppConfigContext';
import '../styles/globals.css';
import { API_KEYS } from '../utils/config';
import NextApp from 'next/app';
import type { AppContext } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // Pass environment variables to the client
  const env = pageProps.env || {
    [API_KEYS.TRANSLATION]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
    [API_KEYS.VISION]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
    [API_KEYS.GEMINI]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY,
  };

  return (
    <AppConfigProvider>
      <Component {...pageProps} env={env} />
    </AppConfigProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      env: {
        [API_KEYS.TRANSLATION]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TRANSLATION_API_KEY,
        [API_KEYS.VISION]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY,
        [API_KEYS.GEMINI]: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_GEMINI_API_KEY,
      }
    }
  };
};

export default MyApp; 