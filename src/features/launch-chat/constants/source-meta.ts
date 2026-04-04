import type { IconProps } from "@phosphor-icons/react";
import { Globe, RedditLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { ResearchBucket } from "@/types/launch";

export type SourceKey = ResearchBucket["source"];

export type SourceMetaEntry = {
  label: string;
  icon: ComponentType<IconProps>;
  /** Brand-tinted icon color (Phosphor fill). */
  iconClassName: string;
};

export const sourceMeta: Record<SourceKey, SourceMetaEntry> = {
  reddit: {
    label: "Reddit",
    icon: RedditLogo,
    iconClassName: "text-[#FF4500]",
  },
  youtube: {
    label: "YouTube",
    icon: YoutubeLogo,
    iconClassName: "text-[#FF0000]",
  },
  x: {
    label: "X (Twitter)",
    icon: XLogo,
    iconClassName: "text-[#000000] dark:text-white",
  },
  web: {
    label: "Web Search",
    icon: Globe,
    iconClassName: "text-sky-500",
  },
};

export const sourceOrder: SourceKey[] = ["reddit", "youtube", "web"];
