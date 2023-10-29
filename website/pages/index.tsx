import {
  formatAtom,
  formattingOffersAtom,
  lengthAtom,
  locationsAtom,
  nbCitiesSelectedAtom,
} from "@/atoms";
import ActionBar from "@/components/ActionBar";
import Footer from "@/components/Footer";
import Table from "@/components/Table";
import WelcomingModal from "@/components/WelcomingModal";

import {
  RowData,
  SelectableCity,
  SelectableFormat,
  SelectableLength,
} from "@/types";
import { abortFormatting, formatLocations } from "@/utils/locations-formatting";
import { Stack } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { Offer, OfferWithLocationToBeFormatted } from "../../types";

interface Props {
  data: RowData[];
  dataDate: string;
}

const NOT_SPECIFIED = "Not specified";

export default function Home() {
  const [data, setData] = useState<Offer[]>([]);
  const [dataDate, setDataDate] = useState<string>("");

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

  const updateData = async () => {
    const data = localStorage.getItem("offersWithLocationToBeFormatted");

    if (!data) {
      return;
    }

    const {
      offers,
      lastUpdated,
    }: { offers: OfferWithLocationToBeFormatted[]; lastUpdated: string } =
      JSON.parse(data);

    window.onbeforeunload = function () {
      return "Data is currently processed and will be lost if you leave the page, are you sure?";
    };
    window.onunload = function () {
      abortFormatting();
    };

    setIsFormattingLocations(true);

    const formattedOffers = await formatLocations(offers);

    window.onbeforeunload = null;
    window.onunload = null;

    if (formattedOffers === null) {
      console.log("An error occured while formatting the offers");
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
    setDataDate(new Date(lastUpdated).toLocaleDateString("fr-CH"));

    setIsFormattingLocations(false);
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
      if (citiesByCountry.hasOwnProperty(l.country)) {
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
  const setIsFormattingLocations = useSetAtom(formattingOffersAtom);

  useEffect(() => {
    setSelectableFormats(
      Array.from(new Set(data.flatMap((d) => d.format))).map((format) => {
        return { name: format, selected: false };
      }) as SelectableFormat[]
    );
  }, [data, setSelectableFormats]);

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

      <WelcomingModal dataDate={dataDate} />

      <Stack style={{ height: "100vh" }} p="xl">
        <ActionBar
          nbCitiesSelected={nbCitiesSelected}
          companies={companies}
          dataDate={dataDate}
        />

        <Table data={data} />
        <Footer />
      </Stack>
    </>
  );
}
