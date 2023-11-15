import { asideOfferAtom } from "@/atoms";
import { Button } from "@mantine/core";
import { useAtomValue } from "jotai";
import HeartIcon from "./HeartIcon";
import LocationDotIcon from "./icons/LocationDotIcon";
import ArrowRightLongIcon from "./icons/ArrowRightLongIcon";
import EyeSlashIcon from "./icons/EyeSlashIcon";
import BriefcaseIcon from "./icons/BriefcaseIcon";
import { formatToLabel } from "@/utils/format";
import ClockIcon from "./icons/ClockIcon";
import { getFlagEmojiWithName } from "@/utils/countries";
import LanguageIcon from "./icons/LanguageIcon";

export default function OfferDescription() {
  const asideOffer = useAtomValue(asideOfferAtom);

  // const [favoriteInternships, setFavoriteInternships] = useLocalStorage({
  //   key: "favorite-internships",
  //   getInitialValueInEffect: true,
  //   defaultValue: [] as string[],
  // });

  // const isFavorite = favoriteInternships.includes(asideOffer?.number ?? "");

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
                  {location.country && `, ${location.country}`}
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
          <p>Type de poste</p>
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
          <p>Durée</p>

          <p className="tw-col-start-2 tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-w-fit">
            {asideOffer?.length ?? "Not specified"}
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
            Object.entries(asideOffer?.languages ?? {}).length > 0 ? (
              Object.entries(asideOffer?.languages ?? {})
                .filter(([_, value]) => value != "")
                .map(([language, level], index) => (
                  <p
                    key={index}
                    className="tw-text-gray-600 tw-text-sm tw-py-2 tw-px-3 tw-bg-gray-200 tw-rounded-md tw-flex tw-flex-row tw-items-center tw-gap-2"
                  >
                    <span>
                      {getFlagEmojiWithName(countryName(language)) ??
                        `${
                          language.charAt(0).toUpperCase() + language.slice(1)
                        }:`}
                    </span>
                    <span> {level}</span>
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

        <HeartIcon
          checked={asideOffer?.favorite ?? false}
          // onClick={() => {
          //   let checked = !isFavorite;
          //   let number = asideOffer?.number ?? "";
          //   setFavoriteInternships((favorites) => {
          //     if (checked) {
          //       if (!favorites.includes(number)) {
          //         return [...favorites, number];
          //       }
          //       return favorites;
          //     } else {
          //       return favorites.filter((f) => f !== number);
          //     }
          //   });
          // }}
        />

        <EyeSlashIcon className="tw-w-6 tw-h-6 tw-text-gray-500" />
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Description</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.description ?? "Not specified"}
        </p>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Required skills</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.requiredSkills ?? "Not specified"}
        </p>
      </div>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Remarks</h3>
        <p
          className="tw-text-gray-900 tw-whitespace-pre-line"
          style={{ wordBreak: "break-word" }}
        >
          {asideOffer?.remarks ?? "Not specified"}
        </p>
      </div>
    </div>
  );
}
