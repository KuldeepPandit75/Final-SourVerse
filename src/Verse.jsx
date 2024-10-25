import React from "react";
import PhaserGame from "./PhaserGame";

function Verse() {
  return (
    <div className="App">
      <PhaserGame />
      <div
        className="buttons"
        style={{ display: "flex", justifyContent: "center", gap: "10px" }}
      >
        <button className="button button-payment" style={{ display: "none" }}>
          💸 Pay Now
        </button>
        <button className="button button-video" style={{ display: "none" }}>
          📹 Video Call
        </button>
      </div>
    </div>
  );
}

export default Verse;
