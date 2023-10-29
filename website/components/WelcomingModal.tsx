import {
  Modal,
  Title,
  Text,
  Stack,
  Divider,
  Alert,
  Group,
  Button,
} from "@mantine/core";
import { useCounter, useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons";
import { useEffect } from "react";

const PageOne = () => (
  <>
    <Text>
      The official interface tends to be not particularly user-friendly,
      especially when it comes to filtering locations. For example, if you want
      to look for internships in{" "}
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
      This concept notably aims to address this particular issue. The exact
      cities have been extracted from the original list of locations using{" "}
      <Text span fw={700} c="red" className="shine">
        GPT-3
      </Text>
      .
    </Text>
  </>
);

const PageTwo = ({ dataDate }: { dataDate: string }) => (
  <>
    <Text>
      The data used to build this website is extracted from the official
      interface of IS-Academia. It is then processed and stored locally on your
      computer.
    </Text>

    <Text>
      The data is not updated automatically. You can update it manually by
      following the instructions of the Chrome extension.
    </Text>

    <Alert
      icon={<IconAlertCircle size={16} />}
      title="This website don't replace IS-Academia"
      color="red"
    >
      Once you identify an internship of interest, please take note of its
      number and look for it on IS-Academia, where you can submit your
      application.
    </Alert>
  </>
);

export default function WelcomingModal({ dataDate }: { dataDate: string }) {
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
        {modalPageCounter == 0 && <PageOne />}
        {modalPageCounter > 0 && <PageTwo dataDate={dataDate} />}

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
  );
}
