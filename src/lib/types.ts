export type Plugin = {
  id: string;
  name: string;
  version: string;
  order: number;
  phase: "SPIN" | "POST_SPIN";
  requires?: string;
  status: "Enabled" | "Disabled";
};
