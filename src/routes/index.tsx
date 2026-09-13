import { createFileRoute } from "@tanstack/react-router";
import VideoSpeedPlayer from "@/components/VideoSpeedPlayer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Video Speed Player — Play Local Videos at Any Speed" },
      {
        name: "description",
        content:
          "Pick a video from your phone and play it from 0.25x to 3x. Works offline, nothing is ever uploaded.",
      },
      { property: "og:title", content: "Video Speed Player" },
      {
        property: "og:description",
        content:
          "Pick a video from your phone and play it from 0.25x to 3x. Works offline, nothing is ever uploaded.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideoSpeedPlayer,
});
