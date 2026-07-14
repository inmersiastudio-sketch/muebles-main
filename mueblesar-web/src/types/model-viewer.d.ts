import type * as React from "react";

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        "ios-src"?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-scale"?: "auto" | "fixed";
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "touch-action"?: string;
        "shadow-intensity"?: string;
        "shadow-softness"?: string;
        "environment-image"?: string;
        exposure?: string;
        "interaction-prompt"?: string;
        "interaction-prompt-threshold"?: string;
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
      };
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}
