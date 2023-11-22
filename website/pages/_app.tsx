import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";

import { API_URL } from "@/utils/constants";
import { Anchor, MantineProvider, createTheme } from "@mantine/core";
import {
  useCounter,
  useIsomorphicEffect,
  useLocalStorage,
} from "@mantine/hooks";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isChrome } from "react-device-detect";
import { ErrorBoundary } from "react-error-boundary";

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

  const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
  const extensionRequiredVersion = process.env.NEXT_PUBLIC_EXTENSION_VERSION;

  if (!extensionId) {
    throw new Error("Extension id not defined");
  }

  if (!extensionRequiredVersion) {
    throw new Error("Extension version not defined");
  }

  const theme = createTheme({
    /** Put your mantine theme override here */
    primaryColor: "red",
  });

  // Then redefine the old console
  console = newConsole;

  const [checkCounter, { increment: incrementCheckCounter }] = useCounter(0);

  useIsomorphicEffect(() => {
    const width = window.innerWidth;

    // If the user is on a mobile device, redirect him to the not supported page
    if (width < 640) {
      console.log("Not supported on mobile");
      router.push("/not-supported");
      return;
    }

    // If the user is not on chrome, redirect him to the not supported page
    if (!isChrome) {
      console.log("Not supported on this browser");
      router.push("/not-supported");
      return;
    }

    // If the extension is not installed, redirect him to the not supported page
    if (!chrome.runtime) {
      console.log("Extension not installed");
      router.push("/not-supported");
      return;
    }

    try {
      // If the extension version is outdated, redirect him to the not supported page
      chrome.runtime.sendMessage(
        extensionId,
        { message: "version" },
        function (reply) {
          if (reply && reply.version) {
            // Version is a string like "0.0.0.1"
            // Check if the version is greater than the required version
            if (reply.version < extensionRequiredVersion) {
              console.log("Extension version outdated");
              router.push("/not-supported");
            } else {
              router.push("/");
              incrementCheckCounter();
            }
          } else {
            router.push("/not-supported");
          }
        }
      );
    } catch (error) {
      router.push("/not-supported");
    }
  }, []);

  const [apiKey, _] = useLocalStorage({
    key: "apiKey",
    defaultValue: "",
    getInitialValueInEffect: false,
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (checkCounter === 0) return;
    if (pathname === "/not-supported") return;

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
        if (pathname === "/welcome") {
          router.push("/");
        }
        if (checkCounter === 1) {
          incrementCheckCounter();
        }
      } else if (res.status === 401 || res.status === 403) {
        router.push("/welcome");
      }
    });
  }, [apiKey, checkCounter, pathname]);

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
          <Component {...pageProps} isReady={checkCounter >= 2} />
        </ErrorBoundary>
      </MantineProvider>
      <Analytics />
    </>
  );
}
