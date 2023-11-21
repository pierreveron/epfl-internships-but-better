import { Location, Offer, OfferToBeFormatted } from "../../types";
import { API_URL } from "./constants";

const controller = new AbortController();

export function abortFormatting() {
  controller.abort();
}

export function formatOffers(offers: OfferToBeFormatted[]): Promise<Offer[]> {
  const salaries = offers.map((offer) => offer.salary);
  const salariesMap = formatSalaries(salaries);

  const locations = offers.map((offer) => offer.location);
  const locationsMap = formatLocations(locations);

  return Promise.all([salariesMap, locationsMap]).then(
    ([salariesMap, locationsMap]) => {
      const formattedOffers = offers.map((offer) => ({
        ...offer,
        salary: salariesMap ? salariesMap[offer.salary] : offer.salary,
        location: locationsMap
          ? locationsMap[offer.location]
          : [{ city: offer.location, country: null }],
      }));
      return formattedOffers;
    }
  );
}

function formatSalaries(salaries: string[]) {
  return fetch(`${API_URL}/clean-salaries`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": localStorage.getItem("apiKey") || "",
    },
    body: JSON.stringify(salaries),
  })
    .then((response) => {
      if (response.ok) return response.json();

      throw new Error("Network response was not ok.");
    })
    .then((data: { salaries: { [key: string]: string } }) => {
      console.log("Formatted!:", data);
      return data.salaries;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

function formatLocations(locations: string[]) {
  return fetch(`${API_URL}/clean-locations`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": localStorage.getItem("apiKey") || "",
    },
    body: JSON.stringify(locations),
  })
    .then((response) => {
      if (response.ok) return response.json();

      throw new Error("Network response was not ok.");
    })
    .then((data: { locations: { [key: string]: Location[] } }) => {
      console.log("Formatted!:", data);
      return data.locations;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}
