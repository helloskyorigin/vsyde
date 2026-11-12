export type SignalKey = "headline" | "action" | "pricing" | "trust";
export type EvidenceSignal = { key: SignalKey; label: string; observed: boolean; excerpt: string; sourceUrl?: string };
export type InspectedPage = { url: string; title: string; role: "homepage" | "pricing" | "product" | "trust"; status: "inspected" | "unavailable"; note?: string; signals: EvidenceSignal[] };
export type InspectionSite = {
  url: string; domain: string; title: string;
  status: "inspected" | "unavailable"; signals: EvidenceSignal[];
  note?: string; inspectedAt?: string; pages?: InspectedPage[];
};
export type BattleInspection = {
  status: "complete" | "partial" | "unavailable";
  createdAt: string; own: InspectionSite; competitor: InspectionSite;
  leader: "own" | "competitor" | null;
  summary: string; methodology: string;
};
