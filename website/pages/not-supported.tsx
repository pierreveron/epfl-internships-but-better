import { Anchor } from "@mantine/core";

export default function NotSupportedPage() {
  return (
    <div className="tw-h-screen tw-w-screen tw-p-8 sm:tw-px-0 sm:tw-w-min tw-mx-auto tw-flex tw-flex-col tw-justify-center tw-gap-4">
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
      <p className="tw-text-gray-900 tw-text-base">
        To use this website, you need to use{" "}
        <span className="tw-font-semibold">Google Chrome</span> on a computer
        and have its associated{" "}
        <Anchor
          href="https://chromewebstore.google.com/detail/cgdpalglfipokmbjbofifdlhlkpcipnk"
          target="_blank"
          underline="never"
        >
          extension
        </Anchor>{" "}
        installed and activated.
      </p>

      <p className="tw-text-gray-900 tw-text-base">
        Please contact{" "}
        <Anchor
          href="https://www.linkedin.com/in/pierre-veron/"
          target="_blank"
          underline="never"
        >
          Pierre Véron
        </Anchor>{" "}
        if you have any questions.
      </p>
    </div>
  );
}
