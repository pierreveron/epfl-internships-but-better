import { asideOfferAtom } from "@/atoms";
import { useAtomValue } from "jotai";
import LocationDotIcon from "./icons/LocationDotIcon";

export default function OfferDescription() {
  const asideOffer = useAtomValue(asideOfferAtom);

  return (
    <>
      <h2 className="tw-text-2xl tw-font-bold">{asideOffer?.title}</h2>
      <p className="tw-text-lg tw-font-medium tw-italic">
        {asideOffer?.company}
      </p>

      <div className="tw-flex tw-flex-row tw-gap-4">
        <LocationDotIcon className="tw-w-4 tw-h-4 tw-text-gray-500" />
        <div className="tw-flex tw-flex-col">
          {asideOffer?.location?.map((location, index) => (
            <p key={index} className="tw-text-gray-500">
              - {location.city}, {location.country}
            </p>
          ))}
        </div>
      </div>

      <p className="tw-text-gray-500">
        <span className="tw-font-medium">Format:</span>{" "}
        {asideOffer && asideOffer?.format.length > 0
          ? asideOffer.format.join(", ")
          : "Not specified"}
      </p>

      <p className="tw-text-gray-500">
        <span className="tw-font-medium">Length:</span>{" "}
        {asideOffer?.length ?? "Not specified"}
      </p>

      <p className="tw-text-gray-500">
        <span className="tw-font-medium">Number:</span>{" "}
        {asideOffer?.number ?? "Not specified"}
      </p>

      <div className="tw-mt-4">
        <h3 className="tw-text-xl tw-font-medium">Description</h3>
        <p className="tw-text-gray-900">
          {asideOffer?.description ?? "Not specified"}
        </p>
      </div>
    </>
  );
}
