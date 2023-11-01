import { Offer, OfferWithLocationToBeFormatted, Location } from "../../types";

const API_URL = "https://epfl-internships-but-better-api.onrender.com";

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
    .then((response) => {
      if (response.ok) return response.json();

      throw new Error("Network response was not ok.");
    })
    .then((data: { locations: { [key: string]: Location[] } }) => {
      console.log("Formatted!:", data);
      const { locations } = data;
      // Replace offers original location by new one
      const correctedJobOffers = jobOffers.map((offer) => ({
        ...offer,
        location: locations[offer.location] || [
          { city: offer.location, country: null },
        ],
      })) as Offer[];
      return correctedJobOffers;
    })
    .catch((error) => {
      console.error("Error:", error);
      return null;
    });
}
