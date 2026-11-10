import { ImageResponse } from "next/og";

export const alt = "vsyde — Your website. Their website. Who wins?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "linear-gradient(140deg,#ffffff,#eff5ff)", color: "#101626", padding: 74, flexDirection: "column", justifyContent: "space-between", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", borderRadius: 22, width: 62, height: 62, background: "#1767ec", color: "white", fontSize: 38, fontWeight: 800, justifyContent: "center", alignItems: "center" }}>v</div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>vsyde</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 72, letterSpacing: -4, fontWeight: 800, lineHeight: 1.04 }}>Your website. Their website.</div>
        <div style={{ display: "flex", fontSize: 78, letterSpacing: -4, fontWeight: 800, color: "#1767ec" }}>Who wins?</div>
        <div style={{ display: "flex", fontSize: 29, color: "#52637d" }}>Compare the evidence. Discover what to improve.</div>
      </div>
    </div>, size,
  );
}
