import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";

import { API_URL } from "@/utils/constants";
import { Anchor, MantineProvider, createTheme } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocalStorage } from "@mantine/hooks";

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

  const theme = createTheme({
    /** Put your mantine theme override here */
    primaryColor: "red",
  });

  // Then redefine the old console
  console = newConsole;

  const [apiKey, _] = useLocalStorage({
    key: "apiKey",
    defaultValue: "",
    getInitialValueInEffect: false,
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (apiKey === "") {
      router.push("/welcome");
    }

    fetch(API_URL, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
    }).then((res) => {
      if (res.ok) {
        // Redirect to / if the user is on /welcome
        if (pathname === "/welcome") router.push("/");
      } else {
        if (pathname !== "/welcome") router.push("/welcome");
      }
    });
  }, [apiKey]);

  return (
    <>
      <MantineProvider theme={theme}>
        <ErrorBoundary
          fallback={
            <div className="tw-h-screen tw-flex tw-flex-col tw-justify-center tw-items-center">
              <h3 className="tw-text-2xl tw-text-[#868e96] tw-font-semibold">
                Oups... <span className="tw-text-3xl">🙇‍♂️</span>
              </h3>
              <h3 className="tw-text-xl tw-text-[#868e96] tw-font-medium">
                Something went wrong while loading the data
              </h3>
              <p className="tw-text-lg tw-text-[#868e96]">
                Please try again (we never know{" "}
                <span className="tw-text-xl">🤷‍♂️</span>) & contact Pierre Véron
                on{" "}
                <Anchor
                  href="https://www.linkedin.com/in/pierre-veron/"
                  target="_blank"
                >
                  Linkedin
                </Anchor>{" "}
                or by <Anchor href="mailto:pierre.veron@epfl.ch">email</Anchor>
              </p>
            </div>
          }
        >
          <Component {...pageProps} />
        </ErrorBoundary>
      </MantineProvider>
      <Analytics />
    </>
  );
}
