import { Plugin } from "./types";

export const initialPlugins: Plugin[] = [
  { id: "base-spin", name: "Base Spin Plugin", version: "0.1", order: 100, phase: "SPIN", status: "Enabled" },
  {
    id: "scatter-base",
    name: "Scatter Base Plugin",
    version: "0.1",
    order: 200,
    phase: "SPIN",
    requires: "Base Spin",
    status: "Enabled",
  },
  {
    id: "free-spins",
    name: "Free Spins Plugin",
    version: "0.1",
    order: 900,
    phase: "POST_SPIN",
    requires: "Scatter Base",
    status: "Disabled",
  },
];
