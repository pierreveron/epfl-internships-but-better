import { Format } from "../../types";

export function formatToLabel(format: Format) {
  switch (format) {
    case "internship":
      return "Internship";
    case "project":
      return "Master Project";
  }
}
