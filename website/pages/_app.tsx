import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "mantine-datatable/styles.css";

import { API_URL } from "@/utils/constants";
import {
  Anchor,
  Button,
  Group,
  MantineProvider,
  Modal,
  TextInput,
  createTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useInputState, useLocalStorage } from "@mantine/hooks";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import UnlockIcon from "@/components/icons/UnlockIcon";

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

  const [apiKey, setApiKey] = useLocalStorage({
    key: "apiKey",
    defaultValue: "",
    getInitialValueInEffect: false,
  });

  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(true);

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (apiKey == "") {
      setIsApiKeyValid(false);
      return;
    }

    fetch(API_URL, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
    }).then((res) => {
      if (res.ok) {
        setIsApiKeyValid(true);
      } else {
        setIsApiKeyValid(false);
      }
    });
  }, [apiKey]);

  const form = useForm({
    initialValues: { key: "" },
  });

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
          <Modal
            opened={!isApiKeyValid}
            onClose={() => {}}
            fullScreen
            withCloseButton={false}
            radius={0}
            transitionProps={{ transition: "fade", duration: 200 }}
            styles={{
              body: { height: "100%" },
            }}
          >
            <div className="tw-mx-auto tw-my-auto tw-w-fit tw-h-full tw-flex tw-flex-col tw-justify-center tw-gap-4">
              <h1 className="tw-text-5xl tw-text-center tw-font-semibold">
                <span className="tw-text-[red]">EPFL</span> internships but
                better
              </h1>
              <form
                onSubmit={form.onSubmit(({ key }) => {
                  setIsFetching(true);

                  fetch(API_URL, {
                    method: "GET",
                    headers: {
                      "X-API-Key": key,
                    },
                  })
                    .then((res) => {
                      if (res.ok) {
                        setApiKey(key);
                        setIsApiKeyValid(true);
                      } else {
                        form.setFieldError("key", "Invalid key");
                      }
                    })
                    .catch(() => {
                      form.setFieldError("key", "An error occured...");
                    })
                    .finally(() => setIsFetching(false));
                })}
              >
                <TextInput
                  label="Secret key"
                  placeholder="Enter your secret key"
                  {...form.getInputProps("key")}
                />
                <Group justify="flex-end" mt="sm">
                  <Button
                    className="tw-mt-4"
                    type="submit"
                    loading={isFetching}
                    disabled={form.getInputProps("key").value == ""}
                    rightSection={
                      <UnlockIcon className="tw-w-4 tw-h-4 tw-fill-current" />
                    }
                  >
                    Enter
                  </Button>
                </Group>
              </form>
            </div>
          </Modal>
          {isApiKeyValid && <Component {...pageProps} />}
        </ErrorBoundary>
      </MantineProvider>
      <Analytics />
    </>
  );
}
