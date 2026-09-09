import type { ReactNode } from "react";
import { REVIEW } from "./mode";

/**
 * Edge metadata. Renders in review mode and nowhere else.
 *
 * Use it for the street-and-clock headers, plate names, state labels and any
 * other note that exists so a shot can be judged. Never for product content.
 */
export const Meta = ({ children }: { children: ReactNode }) => (REVIEW ? <>{children}</> : null);
