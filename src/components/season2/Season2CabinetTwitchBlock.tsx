import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TwitchChannelState = {
  login: string;
  displayName: string;
  isLive: boolean;
  stream: {
    title: string;
    viewerCount: number;
    startedAt: string;
  } | null;
  latestVideo: {
    id: string;
    title: string;
    createdAt: string;
    duration: string;
  } | null;
};

const fallbackChannels: TwitchChannelState[] = [
  { login: "bpl2026", displayName: "bpl2026", isLive: false, stream: null, latestVideo: null },
  { login: "bpl2027", displayName: "bpl2027", isLive: false, stream: null, latestVideo: null },
];

async function loadTwitchChannels() {
  const response = await fetch("/api/season2?resource=twitch");
  if (!response.ok) throw new Error("Twitch status failed.");
  const payload = await response.json() as { channels: TwitchChannelState[] };
  return payload.channels;
}

function orderTwitchChannels(channels: TwitchChannelState[]) {
  const preferredOrder = ["bpl2026", "bpl2027"];

  return [...channels].sort((first, second) => {
    const firstIndex = preferredOrder.indexOf(first.login);
    const secondIndex = preferredOrder.indexOf(second.login);

    if (firstIndex === -1 && secondIndex === -1) return first.login.localeCompare(second.login);
    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;
    return firstIndex - secondIndex;
  });
}

export function Season2CabinetTwitchBlock() {
  const [channels, setChannels] = useState<TwitchChannelState[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadTwitchChannels()
      .then(setChannels)
      .catch(() => setChannels([]));
  }, []);

  const visibleChannels = useMemo(() => orderTwitchChannels(channels.length ? channels : fallbackChannels), [channels]);
  const activeChannel = visibleChannels[activeIndex] ?? visibleChannels[0];
  const canSlide = visibleChannels.length > 1;

  useEffect(() => {
    if (activeIndex > visibleChannels.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleChannels.length]);

  if (!activeChannel) return null;

  const shiftSlide = (direction: -1 | 1) => {
    setActiveIndex(current => (current + direction + visibleChannels.length) % visibleChannels.length);
  };

  return (
    <article className="overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e]">
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${activeChannel.isLive ? "bg-[#fe008a]" : "bg-white/25"}`} />
            <h3 className="truncate text-[1.02rem] font-extrabold leading-tight text-white">
              twitch.tv/{activeChannel.login}
            </h3>
          </div>
          <div className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-white/45">
            {activeChannel.isLive ? "Live зараз" : activeChannel.latestVideo ? "Останній ефір" : "Канал офлайн"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canSlide && (
            <>
              <button
                type="button"
                onClick={() => shiftSlide(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#bbf903] text-[#111111]"
                aria-label="Попередній канал"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => shiftSlide(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#bbf903] text-[#111111]"
                aria-label="Наступний канал"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <a
            href={`https://www.twitch.tv/${activeChannel.login}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[#bbf903]"
            aria-label="Відкрити Twitch"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="aspect-video bg-black">
        <iframe
          title={`Twitch ${activeChannel.login}`}
          src={getTwitchEmbedUrl(activeChannel)}
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {(activeChannel.stream?.title || activeChannel.latestVideo?.title) && (
        <div className="border-t border-white/10 px-3 py-2 text-xs font-bold leading-5 text-white/58">
          {activeChannel.stream?.title ?? activeChannel.latestVideo?.title}
        </div>
      )}
    </article>
  );
}

function getTwitchEmbedUrl(channel: TwitchChannelState) {
  const parent = typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "broleague.online";

  if (!channel.isLive && channel.latestVideo) {
    return `https://player.twitch.tv/?video=${channel.latestVideo.id}&parent=${encodeURIComponent(parent)}&muted=true`;
  }

  return `https://player.twitch.tv/?channel=${channel.login}&parent=${encodeURIComponent(parent)}&muted=true`;
}
