import {
  asideAtom,
  formatAtom,
  formattingOffersAtom,
  isAsideMaximizedAtom,
  lengthAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
} from "@/atoms";
import ActionBar from "@/components/ActionBar";
import Footer from "@/components/Footer";
import Table from "@/components/Table";

import OfferDescription from "@/components/OfferDescription";
import BackwardStepIcon from "@/components/icons/BackwardStepIcon";
import ForwardStepIcon from "@/components/icons/ForwardStepIcon";
import MaximizeIcon from "@/components/icons/MaximizeIcon";
import MinimizeIcon from "@/components/icons/MinimizeIcon";
import XMarkIcon from "@/components/icons/XMarkIcon";
import { SelectableCity, SelectableLength } from "@/types";
import { useAsyncError } from "@/utils/error";
import { useAsideNavigation } from "@/utils/hooks";
import { abortFormatting, formatOffers } from "@/utils/offerFormatting";
import { ActionIcon, Anchor, AppShell, ScrollArea, Stack } from "@mantine/core";
import classNames from "classnames";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { Offer, OfferToBeFormatted } from "../../types";
import { useHotkeys, useViewportSize } from "@mantine/hooks";

const NOT_SPECIFIED = "Not specified";

export default function Home() {
  const [data, setData] = useState<Offer[]>([]);
  const [dataDate, setDataDate] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const loadOffers = async () => {
    const data = localStorage.getItem("jobOffers");

    console.log("Loading job offers from local storage of the extension");

    if (data) {
      const { offers, lastUpdated }: { offers: Offer[]; lastUpdated: string } =
        JSON.parse(data);

      setData(offers);
      setDataDate(new Date(lastUpdated).toLocaleDateString("fr-CH"));
    } else {
      updateData();
    }
  };

  const throwError = useAsyncError();

  const updateData = async () => {
    const data = localStorage.getItem("offersToBeFormatted");

    if (!data) {
      return;
    }

    const {
      offers,
      lastUpdated,
    }: {
      offers: OfferToBeFormatted[];
      lastUpdated: string;
    } = JSON.parse(data);

    setDataDate(new Date(lastUpdated).toLocaleDateString("fr-CH"));

    window.onbeforeunload = function () {
      return "Data is currently processed and will be lost if you leave the page, are you sure?";
    };
    window.onunload = function () {
      abortFormatting();
    };

    setIsFormattingOffers(true);

    let formattedOffers;
    try {
      formattedOffers = await formatOffers(offers);
    } catch (error) {
      throwError(error);
      setIsFormattingOffers(false);
      return;
    }

    window.onbeforeunload = null;
    window.onunload = null;

    if (formattedOffers === null) {
      console.log("An error occured while formatting the offers");
      setIsError(true);
      return;
    }

    localStorage.setItem(
      "jobOffers",
      JSON.stringify({
        offers: formattedOffers,
        lastUpdated,
      })
    );

    setData(formattedOffers);

    setIsFormattingOffers(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.addEventListener("jobOffersUpdated", () => {
        console.log("jobOffersUpdated");
        updateData();
      });

      loadOffers();
    }
  }, []);

  const locations = useMemo(() => data.map((d) => d.location), [data]);

  const citiesByCountry = useMemo(() => {
    const citiesByCountry: Record<string, SelectableCity[]> = {};
    locations.flat().forEach((l) => {
      if (l.country !== null && citiesByCountry.hasOwnProperty(l.country)) {
        if (
          citiesByCountry[l.country]?.map((c) => c.name).includes(l.city) ||
          l.city === null
        ) {
          return;
        }
        citiesByCountry[l.country]?.push({ name: l.city, selected: false });
      } else {
        citiesByCountry[l.country ?? NOT_SPECIFIED] = [
          { name: l.city, selected: false },
        ];
      }
    });

    Object.keys(citiesByCountry).forEach((country) => {
      citiesByCountry[country] = citiesByCountry[country].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
    return citiesByCountry;
  }, [locations]);

  const setSelectableFormats = useSetAtom(formatAtom);
  const setSelectableLengths = useSetAtom(lengthAtom);
  const setSelectableLocations = useSetAtom(locationsAtom);
  const nbCitiesSelected = useAtomValue(nbCitiesSelectedAtom);
  const setIsFormattingOffers = useSetAtom(formattingOffersAtom);
  const [{ open: isAsideOpen }, setAside] = useAtom(asideAtom);
  const [isAsideMaximized, setIsAsideMaximized] = useAtom(isAsideMaximizedAtom);

  useHotkeys([
    [
      "Enter",
      () => {
        if (isAsideOpen) setIsAsideMaximized((v) => !v);
      },
    ],
    [
      "Escape",
      () => {
        setAside({ open: false, offer: null });
        setIsAsideMaximized(false);
      },
    ],
  ]);

  useEffect(() => {
    setSelectableFormats([
      { name: "internship", selected: false },
      { name: "project", selected: false },
    ]);
  }, [setSelectableFormats]);

  useEffect(() => {
    setSelectableLengths(
      Array.from(new Set(data.flatMap((d) => d.length))).map((length) => {
        return { name: length, selected: false };
      }) as SelectableLength[]
    );
  }, [data, setSelectableLengths]);

  const companies = useMemo(() => {
    return Array.from(new Set(data.flatMap((d) => d.company))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

  useEffect(() => {
    setSelectableLocations(citiesByCountry);
  }, [citiesByCountry, setSelectableLocations]);

  const {
    canNavigateToNextOffer,
    canNavigateToPreviousOffer,
    navigateToNextOffer,
    navigateToPreviousOffer,
  } = useAsideNavigation();

  const { width } = useViewportSize();

  useEffect(() => {
    if (width <= 992 && isAsideMaximized) {
      setIsAsideMaximized(false);
      return;
    }
  }, [width]);

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

      <AppShell
        aside={{
          width: {
            md: isAsideMaximized ? "100%" : 550,
            lg: isAsideOpen
              ? isAsideMaximized
                ? "100%"
                : "max(40%, 550px)"
              : 0,
          },
          breakpoint: "md",
          collapsed: { mobile: !isAsideOpen, desktop: !isAsideOpen },
        }}
        padding="xl"
      >
        {/* Used the hack below to remove the padding when aside is closed and size is 0, otherwise the aside was still visible */}
        <AppShell.Aside {...(isAsideOpen && !isAsideMaximized && { pl: "xl" })}>
          <AppShell.Section
            mb="sm"
            pt="xl"
            pr={!isAsideMaximized ? "xl" : 0}
            w={isAsideMaximized ? "min(50%, 896px)" : "100%"}
            mx={isAsideMaximized ? "auto" : 0}
          >
            <div className="tw-flex tw-flex-row tw-justify-between">
              <div>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => {
                    setAside({ open: false, offer: null });
                    setIsAsideMaximized(false);
                  }}
                >
                  <XMarkIcon className="tw-w-5 tw-h-5 tw-fill-gray-900" />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={() => setIsAsideMaximized((maximized) => !maximized)}
                  disabled={width <= 992}
                  className="disabled:tw-bg-transparent"
                >
                  {isAsideMaximized ? (
                    <MinimizeIcon
                      className={classNames(
                        "tw-w-4 tw-h-4",
                        width <= 992 ? "tw-fill-gray-200" : "tw-fill-gray-900"
                      )}
                    />
                  ) : (
                    <MaximizeIcon
                      className={classNames(
                        "tw-w-4 tw-h-4",
                        width <= 992 ? "tw-fill-gray-200" : "tw-fill-gray-900"
                      )}
                    />
                  )}
                </ActionIcon>
              </div>
              <div>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  disabled={!canNavigateToPreviousOffer()}
                  className="disabled:tw-bg-transparent"
                  onClick={navigateToPreviousOffer}
                >
                  <BackwardStepIcon
                    className={classNames(
                      "tw-w-4 tw-h-4",
                      !canNavigateToPreviousOffer()
                        ? "tw-fill-gray-300"
                        : "tw-fill-gray-900"
                    )}
                  />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  disabled={!canNavigateToNextOffer()}
                  className="disabled:tw-bg-transparent"
                  onClick={navigateToNextOffer}
                >
                  <ForwardStepIcon
                    className={classNames(
                      "tw-w-4 tw-h-4 ",
                      !canNavigateToNextOffer()
                        ? "tw-fill-gray-300"
                        : "tw-fill-gray-900"
                    )}
                  />
                </ActionIcon>
              </div>
            </div>
          </AppShell.Section>
          <AppShell.Section
            grow
            component={ScrollArea}
            pr={!isAsideMaximized ? "xl" : 0}
          >
            <div
              className={classNames(
                isAsideMaximized && "tw-w-1/2 tw-max-w-4xl tw-mx-auto"
              )}
            >
              <OfferDescription />
            </div>
          </AppShell.Section>
        </AppShell.Aside>
        <AppShell.Main style={{ height: "100vh" }}>
          <Stack style={{ height: "100%" }}>
            <ActionBar
              nbCitiesSelected={nbCitiesSelected}
              companies={companies}
              dataDate={dataDate}
            />

            {isError ? (
              <div className="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center">
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
                  or by{" "}
                  <Anchor href="mailto:pierre.veron@epfl.ch">email</Anchor>
                </p>
              </div>
            ) : (
              <Table data={data} />
            )}

            <Footer />
          </Stack>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
