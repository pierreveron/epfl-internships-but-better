import { SelectableCity } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";

type LocationContextType = {
  locations: Map<string, SelectableCity[]>;
  setLocations: Dispatch<SetStateAction<Map<string, SelectableCity[]>>>;
};

export const LocationsContext = createContext<LocationContextType | null>(null);

// export const useLocations = () => {
// const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
//   const [locations, setLocations] = useState<
//     ({ selected: boolean } & Location)[]
//   >([]);
//   return [locations, setLocations];
// };
