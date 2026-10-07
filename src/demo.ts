import type { Criterion } from "./domain";
export const demo = {
  title: "Campaign Banner Review",
  brand: "FORMA",
  phrase: "Make room for better.",
  brief:
    "Create a premium promotional banner for the fictional FORMA product launch. Show FORMA and the exact launch phrase “Make room for better.” Use a dominant blue visual family. Do not include prices, investment claims, or financial returns. Aim for a clean, premium, minimal composition.",
  artifact: `${import.meta.env.BASE_URL}campaign-banner.png`,
  criteria: [
    {
      id: "C1",
      text: "Brand name is clearly visible",
      importance: "MUST",
      assessment_mode: "BINARY",
    },
    {
      id: "C2",
      text: "Required launch phrase is present",
      importance: "MUST",
      assessment_mode: "BINARY",
    },
    {
      id: "C3",
      text: "Blue is the dominant visual family",
      importance: "MUST",
      assessment_mode: "BINARY",
    },
    {
      id: "C4",
      text: "No prohibited price or investment claim appears",
      importance: "MUST",
      assessment_mode: "BINARY",
    },
    {
      id: "C5",
      text: "Composition follows a clean, premium, minimal direction",
      importance: "SHOULD",
      assessment_mode: "GRADED",
    },
  ] satisfies Criterion[],
};
