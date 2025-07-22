import React from "react";

const VR360Embed = ({ tourUrl }) => (
  <div style={{ width: "100%", height: "600px" }}>
    <iframe
      src={tourUrl}
      width="100%"
      height="100%"
      allow="xr-spatial-tracking; gyroscope; accelerometer"
      allowFullScreen
      frameBorder="0"
      title="360/VR Tour"
    ></iframe>
  </div>
);

export default VR360Embed; 