export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: string;
  youtubeId?: string;
  downloadUrl?: string;
  status: "waiting" | "searching" | "ready" | "downloading" | "done" | "error";
  error?: string;
}
