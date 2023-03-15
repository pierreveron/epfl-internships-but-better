import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Table from "@/components/Table";

import WelcomeModal from "@/components/WelcomeModal";
import { RowData } from "@/types";
import { Stack } from "@mantine/core";
import Head from "next/head";

export interface HomeProps {
  data: RowData[];
  dataDate: string;
}

export default function Home({ data, dataDate }: HomeProps) {
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
      <WelcomeModal dataDate={dataDate} />
      <Stack style={{ height: "100vh" }} p="xl">
        <Header data={data} dataDate={dataDate} />
        <Table data={data} />
        <Footer />
      </Stack>
    </>
  );
}

import { promises as fs } from "fs";
import path from "path";

import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const fileName = "internships-with-good-locations.json";
  const dataPath = path.join(process.cwd(), "/" + fileName);

  const fileContents = await fs.readFile(dataPath, "utf8");
  const { dataDate, data } = JSON.parse(fileContents);

  return {
    props: { data, dataDate },
  };
};
