import dynamic from "next/dynamic";
import type { AppProps } from 'next/app';

// import '../styles/globals.css';
// import 'antd/dist/antd.less';


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Отключаем SSR
export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});
