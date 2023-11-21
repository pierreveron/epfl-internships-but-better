import { asideOfferAtom } from "@/atoms";
import { getFlagEmojiWithName } from "@/utils/countries";
import { formatSalary, formatToLabel } from "@/utils/format";
import { ActionIcon, Anchor, Button } from "@mantine/core";
import { useAtomValue } from "jotai";
import HeartIcon from "./HeartIcon";
import ArrowRightLongIcon from "./icons/ArrowRightLongIcon";
import BriefcaseIcon from "./icons/BriefcaseIcon";
import ClockIcon from "./icons/ClockIcon";
import EyeSlashIcon from "./icons/EyeSlashIcon";
import LanguageIcon from "./icons/LanguageIcon";
import LocationDotIcon from "./icons/LocationDotIcon";
import { formatLengthLabel } from "./LengthsCheckboxes";
import { useFavoriteOffers, useHiddenOffers } from "@/utils/hooks";
import MoneyBillIcon from "./icons/MoneyBillIcon";

export default function OfferDescription() {
  const asideOffer = useAtomValue(asideOfferAtom);

  const { toggleHiddenOffer } = useHiddenOffers();
  const { isOfferFavorite, toggleFavoriteOffer } = useFavoriteOffers();

  const countryName = (language: string) => {
    switch (language) {
      case "french":
        return "France";
      case "german":
        return "Germany";
      case "english":
        return "United Kingdom";
      default:
        return "";
    }
  };

  const formatLanguageLevel = (label: string) => {
    switch (label) {
      case "Elémentaire" || "Basic":
        return "Basic";
      case "Intermédiaire" || "Intermediate":
        return "Intermediate";
      case "Avancé" || "Advanced":
        return "Advanced";
      default:
        return undefined;
    }
  };

  return (
    <div className="tw-pb-8">
      <p className="tw-text-gray-500 tw-text-sm">
        {/* <span className="tw-font-medium">Offer number:</span>{" "} */}
        {asideOffer?.number}
      </p>

      <div className="tw-mb-4">
        <h2 className="tw-text-2xl tw-font-bold">{asideOffer?.title}</h2>
        <p className="tw-text-lg tw-font-medium tw-italic">
          {asideOffer?.company}
        </p>
        <div className="tw-flex tw-flex-col">
          {asideOffer?.companyInfo.website &&
            asideOffer?.companyInfo.website
              .split(";")
              .map((t) => t.trim())
              .map((website, index) => (
                <a
                  key={index}
                  className="tw-text-blue-500 tw-text-sm tw-underline"
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {website}
                </a>
              ))}
        </div>
      </div>

      <div className="tw-mb-4">
        <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <LocationDotIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Location</p>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {asideOffer && asideOffer?.location.length > 0 ? (
              asideOffer?.location.map((location, index) => (
                <p
                  key={index}
                  className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md"
                >
                  {location.city}
                  {location.country &&
                    `, ${location.country} ${getFlagEmojiWithName(
                      location.country
                    )}`}
                </p>
              ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                Not specified
              </p>
            )}
          </div>
        </div>

        <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <BriefcaseIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Position type</p>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {asideOffer && asideOffer?.format.length > 0 ? (
              asideOffer?.format.map((format, index) => (
                <p
                  key={index}
                  className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md"
                >
                  {formatToLabel(format)}
                </p>
              ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                Not specified
              </p>
            )}
          </div>
        </div>

        <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <ClockIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Length</p>

          <p className="tw-col-start-2 tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-w-fit">
            {asideOffer?.length
              ? formatLengthLabel(asideOffer.length)
              : "Not specified"}
          </p>
        </div>

        <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <MoneyBillIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
          <p>Salary</p>

          <p className="tw-col-start-2 tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-w-fit">
            {formatSalary(asideOffer?.salary ?? null)}
          </p>
        </div>

        <div
          className="tw-grid tw-grid-cols-2 tw-grid-rows-2 tw-items-center tw-gap-2"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto",
          }}
        >
          <LanguageIcon className="tw-w-4 tw-text-gray-500" />
          <p>Languages</p>
          <div className="tw-col-start-2 tw-flex tw-flex-row tw-gap-2">
            {asideOffer &&
            Object.entries(asideOffer?.languages ?? {})
              .map(([language, level]) => [
                language,
                formatLanguageLevel(level),
              ])
              .filter(([_, level]) => level !== undefined).length > 0 ? (
              Object.entries(asideOffer?.languages ?? {})
                .map(([language, level]) => [
                  language,
                  formatLanguageLevel(level),
                ])
                .filter(([_, level]) => level !== undefined)
                .map(([language, level], index) => (
                  <p
                    key={index}
                    className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-flex tw-flex-row tw-items-center tw-gap-2"
                  >
                    <span>
                      {getFlagEmojiWithName(countryName(language!)) ??
                        `${
                          language!.charAt(0).toUpperCase() + language!.slice(1)
                        }:`}
                    </span>
                    <span>{level}</span>
                  </p>
                ))
            ) : (
              <p className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md">
                Not specified
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center">
        <Button
          data-offer-id={asideOffer?.id}
          id="register-button"
          component="a"
          href="https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab300"
          target="_blank"
          w={200}
          size="md"
          rightSection={
            <ArrowRightLongIcon className="tw-w-4 tw-h-4 tw-fill-white" />
          }
        >
          Register
        </Button>

        <ActionIcon
          onClick={() => {
            if (asideOffer) {
              toggleFavoriteOffer(asideOffer);
            }
          }}
          variant="subtle"
          color="red"
          size="xl"
        >
          <HeartIcon
            checked={asideOffer !== null && isOfferFavorite(asideOffer)}
          />
        </ActionIcon>
        <ActionIcon
          onClick={() => {
            if (asideOffer) {
              toggleHiddenOffer(asideOffer);
            }
          }}
          variant="subtle"
          color="gray"
          size="xl"
        >
          <EyeSlashIcon className="tw-w-6 tw-fill-gray-900" />
        </ActionIcon>

        <Anchor
          data-offer-id={asideOffer?.id}
          id="view-button"
          href="https://isa.epfl.ch/imoniteur_ISAP/PORTAL14S.htm#tab300"
          target="_blank"
          underline="never"
        >
          View original offer
        </Anchor>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Description</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.description ?? "⊘"}
        </p>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Required skills</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.requiredSkills ?? "⊘"}
        </p>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Remarks</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.remarks != "" ? asideOffer?.remarks : "⊘"}
        </p>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">File</h3>
        {asideOffer && asideOffer.file !== null ? (
          <Anchor
            href={`https://isa.epfl.ch/imoniteur_ISAP/docs/!PORTAL14S.action/${encodeURI(
              asideOffer?.file.fileName
            )}?ww_k_cell=2742535167&ww_x_action=FILE&ww_i_detailstage=${
              asideOffer?.file.detailId
            }&ww_x_filename=${encodeURIComponent(asideOffer?.file.fileName)}`}
            target="_blank"
            underline="never"
          >
            See the file
          </Anchor>
        ) : (
          <p className="tw-text-gray-900 tw-whitespace-pre-line">⊘</p>
        )}
      </div>
    </div>
  );
}
