import { Anchor, Group, Image, Text } from "@mantine/core";

export default function Footer() {
  return (
    <Group spacing="xl">
      <Image width={50} height={50} src="../favicon.ico" alt="website logo" />
      <Text color="dimmed">
        This website is not affiliated to EPFL. It is a personal project from{" "}
        <Anchor
          href="https://www.linkedin.com/in/pierre-veron/"
          target="_blank"
        >
          Pierre Véron
        </Anchor>
        . Code is available on{" "}
        <Anchor
          href="https://github.com/pierreveron/epfl-internships-but-better"
          target="_blank"
        >
          Github
        </Anchor>
        .
      </Text>
    </Group>
  );
}
