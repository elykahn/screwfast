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

export async function getMetroId(
  query: string,
  songkickKey: string
): Promise<{ id: number; name: string } | null> {
  const res = await fetch(
    `https://api.songkick.com/api/3.0/search/locations.json?query=${encodeURIComponent(query)}&apikey=${songkickKey}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const locations: any[] = data?.resultsPage?.results?.location ?? [];
  if (!locations.length) return null;
  return {
    id: locations[0].metroArea.id,
    name: locations[0].metroArea.displayName,
  };
}

export async function getUpcomingEvents(
  metroId: number,
  songkickKey: string
): Promise<any[]> {
  const res = await fetch(
    `https://api.songkick.com/api/3.0/metro_areas/${metroId}/calendar.json?apikey=${songkickKey}&per_page=50`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data?.resultsPage?.results?.event ?? [];
}

export async function getArtistData(
  artistName: string,
  lastfmKey: string
): Promise<{ bio: string; tags: string[]; imageUrl: string; topTracks: string[] }> {
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
  // Last.fm deprecated image serving; filter out the known placeholder hash
  const imageUrl =
    ((info?.artist?.image ?? []) as any[])
      .find((img) => img.size === "extralarge" && img["#text"] && !img["#text"].includes("2a96cbd8b46e442fc41c2b86b821562f"))
      ?.["#text"] ?? "";
  const topTracks = ((tracks?.toptracks?.track ?? []) as any[])
    .slice(0, 5)
    .map((t) => t.name as string);

  return { bio, tags, imageUrl, topTracks };
}
