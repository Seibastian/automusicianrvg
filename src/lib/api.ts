import { supabase } from "@/integrations/supabase/client";
import type { Track } from "@/types/track";

export async function fetchPlaylistTracks(playlistUrl: string): Promise<Track[]> {
  const { data, error } = await supabase.functions.invoke("spotify-playlist", {
    body: { playlistUrl },
  });

  if (error) throw new Error(error.message || "Playlist alınamadı");
  if (data?.error) throw new Error(data.error);

  return (data.tracks || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    artist: t.artist,
    album: t.album,
    albumArt: t.albumArt,
    duration: t.duration,
    status: "pending" as const,
  }));
}

export async function searchYouTube(trackName: string, artist: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("youtube-search", {
    body: { query: `${trackName} ${artist}` },
  });

  if (error) throw new Error(error.message || "YouTube araması başarısız");
  return data?.videoId || null;
}

export async function getDownloadUrl(videoId: string): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("youtube-to-mp3", {
    body: { videoId },
  });

  if (error) throw new Error(error.message || "MP3 dönüştürme başarısız");
  return data?.downloadUrl || null;
}
