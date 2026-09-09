type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

type TwitchTokenResponse = {
  access_token: string;
};

type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  profile_image_url?: string;
};

type TwitchStream = {
  user_login: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
};

type TwitchVideo = {
  id: string;
  user_login: string;
  title: string;
  created_at: string;
  duration: string;
  thumbnail_url: string;
};

const channels = ["bpl2026", "bpl2027"];

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    response.status(500).json({ error: "Missing Twitch environment variables." });
    return;
  }

  try {
    const token = await getTwitchAccessToken(clientId, clientSecret);
    const headers = {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    };
    const users = await twitchGet<{ data: TwitchUser[] }>(
      `https://api.twitch.tv/helix/users?${channels.map(channel => `login=${encodeURIComponent(channel)}`).join("&")}`,
      headers,
    );
    const userIds = users.data.map(user => user.id);

    if (!userIds.length) {
      response.status(200).json({ channels: [] });
      return;
    }

    const [streams, videosByUserId] = await Promise.all([
      twitchGet<{ data: TwitchStream[] }>(
        `https://api.twitch.tv/helix/streams?${userIds.map(id => `user_id=${encodeURIComponent(id)}`).join("&")}`,
        headers,
      ),
      Promise.all(userIds.map(async userId => {
        const videos = await twitchGet<{ data: TwitchVideo[] }>(
          `https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(userId)}&type=archive&first=1&sort=time`,
          headers,
        );
        return [userId, videos.data[0] ?? null] as const;
      })),
    ]);

    response.setHeader?.("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.status(200).json({
      channels: users.data.map(user => {
        const stream = streams.data.find(item => item.user_login.toLowerCase() === user.login.toLowerCase()) ?? null;
        const video = new Map(videosByUserId).get(user.id) ?? null;

        return {
          login: user.login,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url ?? "",
          isLive: Boolean(stream),
          stream: stream ? {
            title: stream.title,
            viewerCount: stream.viewer_count,
            startedAt: stream.started_at,
            thumbnailUrl: normalizeTwitchThumbnail(stream.thumbnail_url),
          } : null,
          latestVideo: video ? {
            id: video.id,
            title: video.title,
            createdAt: video.created_at,
            duration: video.duration,
            thumbnailUrl: normalizeTwitchThumbnail(video.thumbnail_url),
          } : null,
        };
      }),
    });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Twitch API error." });
  }
}

async function getTwitchAccessToken(clientId: string, clientSecret: string) {
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const payload = await result.json() as TwitchTokenResponse & { message?: string };

  if (!result.ok) {
    throw new Error(payload.message ?? "Twitch token request failed.");
  }

  return payload.access_token;
}

async function twitchGet<T>(url: string, headers: Record<string, string>): Promise<T> {
  const result = await fetch(url, { headers });
  const payload = await result.json() as T & { message?: string };

  if (!result.ok) {
    throw new Error(payload.message ?? "Twitch request failed.");
  }

  return payload;
}

function normalizeTwitchThumbnail(url: string) {
  return url
    .replace("%{width}", "640")
    .replace("%{height}", "360");
}
