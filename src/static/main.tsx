import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../styles.css";
import VideoSpeedPlayer from "../components/VideoSpeedPlayer";
import { registerAppServiceWorker } from "../lib/register-sw";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VideoSpeedPlayer />
  </StrictMode>,
);

registerAppServiceWorker();
