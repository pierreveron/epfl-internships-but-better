import { Offer, OfferWithLocationToBeFormatted, Location } from "../../types";

// const API_URL = "https://epfl-internships-but-better-api.onrender.com";
const API_URL = "http://localhost:8000";

const controller = new AbortController();

export function abortFormatting() {
  controller.abort();
}

export function formatLocations(jobOffers: OfferWithLocationToBeFormatted[]) {
  const locationsToBeFormatted = jobOffers.map((offer) => offer.location);
  console.log("Locations:", locationsToBeFormatted);
  const stringifiedLocations = JSON.stringify(locationsToBeFormatted);
  console.log("Stringified locations:", stringifiedLocations);

  console.log("Formatting the locations");

  return fetch(`${API_URL}/clean-locations`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: stringifiedLocations,
  })
    .then((response) => response.json())
    .then((data: { locations: { [key: string]: Location[] } }) => {
      console.log("Formatted!:", data);
      const { locations } = data;
      // Replace offers original location by new one
      const correctedJobOffers = jobOffers.map((offer) => ({
        ...offer,
        location: locations[offer.location],
      })) as Offer[];
      return correctedJobOffers;
    })
    .catch((error) => {
      console.error("Error:", error);
      return null;
    });
}
