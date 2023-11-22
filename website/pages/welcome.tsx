import UnlockIcon from "@/components/icons/UnlockIcon";
import { API_URL } from "@/utils/constants";
import { Anchor, Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

function WelcomePage() {
  const [_, setApiKey] = useLocalStorage({
    key: "apiKey",
    defaultValue: "",
    getInitialValueInEffect: false,
  });

  const [isFetching, setIsFetching] = useState(false);

  const form = useForm({
    initialValues: { key: "" },
  });

  const router = useRouter();

  return (
    <>
      <Head>
        <title>EPFL Interships but better</title>
        <meta
          name="description"
          content="EPFL interships interface redesigned to be more user-friendly"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="tw-h-screen tw-w-screen tw-p-8 sm:tw-px-0 sm:tw-w-min tw-mx-auto tw-flex tw-flex-col tw-justify-center tw-gap-4">
        <div className="sm:tw-w-min tw-space-y-4">
          <div className="tw-space-y-1">
            <h1 className="tw-text-5xl tw-font-semibold tw-text-gray-900 tw-text-left sm:tw-whitespace-nowrap">
              <span className="tw-text-[#fa5252]">EPFL</span> internships but{" "}
              <span className="shine">better</span>
            </h1>

            <p className="tw-text-gray-900 tw-text-base4">
              This website is a redesign concept of the job board on{" "}
              <span className="tw-font-semibold">IS-Academia</span>, the study
              management tool of EPFL.
            </p>
          </div>

          <div className="tw-space-y-1">
            <p className="tw-text-gray-900 tw-text-base">
              In order to use this it, you need to have a secret key. If you
              don&apos;t have one, please contact{" "}
              <Anchor
                href="https://www.linkedin.com/in/pierre-veron/"
                target="_blank"
                underline="never"
              >
                Pierre Véron
              </Anchor>
              . Otherwise, please enter it below.
            </p>

            <p className="tw-text-gray-900 tw-text-base">
              Also, take note that the data is{" "}
              <span className="tw-font-semibold">not updated in real time</span>
              : you need to use the extension every time you want to update the
              data.
            </p>

            <p className="tw-text-gray-900 tw-text-base">
              Finally,{" "}
              <span className="tw-font-semibold">save this website</span> to
              your favorites and{" "}
              <span className="shine tw-font-bold">good luck</span> in your
              search!
            </p>
          </div>
        </div>

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
                  router.push("/");
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
            data-autofocus
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
    </>
  );
}
export default WelcomePage;
