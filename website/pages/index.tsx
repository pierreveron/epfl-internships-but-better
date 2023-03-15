import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Table from "@/components/Table";

import { RowData } from "@/types";
import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCounter, useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons";
import Head from "next/head";
import { useEffect } from "react";

export interface HomeProps {
  data: RowData[];
  dataDate: string;
}

export default function Home({ data, dataDate }: HomeProps) {
  const [hasModalBeenClosed, setHasModalBeenClosed] = useLocalStorage({
    key: "modal-closed",
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [isModalOpened, { close: closeModal }] = useDisclosure(
    !hasModalBeenClosed
  );

  const [
    modalPageCounter,
    {
      increment: incrementModalPageCounter,
      decrement: decrementModalPageCounter,
    },
  ] = useCounter(0);

  useEffect(() => {
    if (modalPageCounter > 1) {
      closeModal();
      setHasModalBeenClosed(true);
    }
  }, [closeModal, setHasModalBeenClosed, modalPageCounter]);

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
      <Modal
        opened={isModalOpened}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {}}
        title={
          <Title order={1}>
            Welcome to{" "}
            <Text c="red">
              EPFL internships{" "}
              <Text span className="shine">
                BUT better
              </Text>
            </Text>
          </Title>
        }
      >
        <Stack>
          <Divider />
          <Title order={4}>
            This website is a redesign concept of the Internships tab on{" "}
            <span style={{ whiteSpace: "nowrap" }}>IS-Academia</span>.
          </Title>
          {modalPageCounter == 0 && (
            <>
              <Text>
                The official interface tends to be not particularly
                user-friendly, especially when it comes to filtering locations.
                For example, if you want to look for internships in{" "}
                <Text span fw={700}>
                  Lausanne
                </Text>
                , you have to select{" "}
                <Text span fw={700}>
                  &quot;Lausanne&quot;
                </Text>{" "}
                but also{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Geneva&quot;
                </Text>
                ,{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Genève&quot;
                </Text>{" "}
                or{" "}
                <Text span fw={700}>
                  &quot;Lausanne/Zurich&quot;
                </Text>{" "}
                and so many more.
              </Text>

              <Text>
                This concept notably aims to address this particular issue. The
                exact cities have been extracted from the original list of
                locations using{" "}
                <Text span fw={700} c="red" className="shine">
                  GPT-3
                </Text>
                .
              </Text>
            </>
          )}
          {modalPageCounter > 0 && (
            <>
              <Text>
                The data used here are internships targeting{" "}
                <Text span fw={700}>
                  Computer Science
                </Text>{" "}
                students.
              </Text>
              <Text>
                If you are from this department, you can use this website to to
                browse available internships assuming the data is{" "}
                <Text span fw={700}>
                  up-to-date
                </Text>
                . Current data dates from the{" "}
                <Text span fw={700} className="shine">
                  {dataDate}
                </Text>
                .
              </Text>
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="This website don't fully replace IS-Academia"
                color="red"
              >
                Once you identify an internship of interest, please take note of
                its number and look for it on IS-Academia, where you can submit
                your application.
              </Alert>
            </>
          )}

          <Group>
            {modalPageCounter > 0 && (
              <Button onClick={decrementModalPageCounter}>Back</Button>
            )}
            <Button ml="auto" onClick={incrementModalPageCounter}>
              {modalPageCounter == 0 ? "Next" : "Done"}
            </Button>
          </Group>
        </Stack>
      </Modal>
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
