import { SelectableCity } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";

type TestContextType = {
  currentUser: Map<string, string>;
  setCurrentUser: Dispatch<SetStateAction<Map<string, string>>>;
};

export const TestContext = createContext<TestContextType | null>(null);
