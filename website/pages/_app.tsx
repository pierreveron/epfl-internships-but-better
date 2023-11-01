import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  /**
   * @see https://stackoverflow.com/questions/7042611/override-console-log-for-production
   */
  // Define a new console
  var newConsole = (function (oldCons) {
    return {
      ...oldCons,
      log: function (message?: any, ...optionalParams: any[]) {
        if (!process.env.NEXT_PUBLIC_DEVELOPMENT) return;
        oldCons.log(message, ...optionalParams);
      },
    };
  })(console);

  // Then redefine the old console
  console = newConsole;

  return (
    <>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
          primaryColor: "red",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
      <Analytics />
    </>
  );
}
