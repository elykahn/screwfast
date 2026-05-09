export interface Concert {
  id: string;
  artistName: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  ticketUrl: string;
  bio: string;
  topTracks: string[];
  tags: string[];
  imageUrl: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<a[^>]*>.*?<\/a>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickImage(event: any): string {
  const attractionImgs: any[] = event._embedded?.attractions?.[0]?.images ?? [];
  const eventImgs: any[] = event.images ?? [];
  const all = [...attractionImgs, ...eventImgs];
  const img =
    all.find((i) => i.ratio === "16_9" && i.width >= 1024 && !i.fallback) ??
    all.find((i) => i.ratio === "16_9" && !i.fallback) ??
    all.find((i) => !i.fallback) ??
    all[0];
  return img?.url ?? "";
}

function tmGenreTags(event: any): string[] {
  return (event.classifications ?? [])
    .flatMap((c: any) => [c.genre?.name, c.subGenre?.name])
    .filter((g: string | undefined) => g && g !== "Undefined");
}

export async function getTicketmasterEvents(
  postalCode: string,
  apiKey: string
): Promise<any[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    postalCode,
    classificationName: "music",
    sort: "date,asc",
    size: "50",
    radius: "50",
    unit: "miles",
  });
  const res = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data?._embedded?.events ?? [];
}

export async function getArtistData(
  artistName: string,
  lastfmKey: string
): Promise<{ bio: string; tags: string[]; topTracks: string[] }> {
  const base = "https://ws.audioscrobbler.com/2.0/";
  const [infoRes, tracksRes] = await Promise.all([
    fetch(
      `${base}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${lastfmKey}&format=json`
    ),
    fetch(
      `${base}?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${lastfmKey}&format=json&limit=5`
    ),
  ]);

  const info = await infoRes.json();
  const tracks = await tracksRes.json();

  const bio = stripHtml(info?.artist?.bio?.summary ?? "").slice(0, 300);
  const tags = ((info?.artist?.tags?.tag ?? []) as any[])
    .slice(0, 6)
    .map((t) => t.name as string);
  const topTracks = ((tracks?.toptracks?.track ?? []) as any[])
    .slice(0, 5)
    .map((t) => t.name as string);

  return { bio, tags, topTracks };
}

export function buildConcert(event: any, lastfm: { bio: string; tags: string[]; topTracks: string[] }): Concert {
  const artistName: string =
    event._embedded?.attractions?.[0]?.name ?? event.name;
  const venue = event._embedded?.venues?.[0];

  // Merge Last.fm tags with Ticketmaster classifications; Last.fm wins if present
  const tags = lastfm.tags.length > 0 ? lastfm.tags : tmGenreTags(event);

  return {
    id: event.id,
    artistName,
    venue: venue?.name ?? "TBD",
    city: venue ? `${venue.city?.name ?? ""}, ${venue.state?.stateCode ?? ""}`.replace(/^, |, $/, "") : "",
    date: event.dates?.start?.localDate ?? "",
    time: event.dates?.start?.timeTBD ? "" : (event.dates?.start?.localTime ?? ""),
    ticketUrl: event.url ?? "",
    bio: lastfm.bio,
    topTracks: lastfm.topTracks,
    tags,
    imageUrl: pickImage(event),
  };
}
