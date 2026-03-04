import { useState, useCallback } from "react";
import { Music, Download, Loader2, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { TrackRow } from "@/components/TrackRow";
import { useToast } from "@/hooks/use-toast";
import { fetchPlaylistTracks, searchYouTube, getDownloadUrl } from "@/lib/api";
import type { Track } from "@/types/track";

const Index = () => {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const readyCount = tracks.filter((t) => t.status === "ready").length;
  const doneCount = tracks.filter((t) => t.status === "done").length;
  const progress = tracks.length > 0 ? ((doneCount + readyCount) / tracks.length) * 100 : 0;

  const handleFetchPlaylist = async () => {
    if (!playlistUrl.trim()) return;
    setLoading(true);
    setTracks([]);
    try {
      const fetchedTracks = await fetchPlaylistTracks(playlistUrl);
      setTracks(fetchedTracks);
      toast({ title: `${fetchedTracks.length} şarkı bulundu!` });
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAll = async () => {
    if (tracks.length === 0) return;
    setProcessing(true);
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      if (track.status !== "pending") continue;
      
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, status: "searching" as const } : t))
      );
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const videoId = await searchYouTube(track.name, track.artist);
        if (!videoId) throw new Error("Video bulunamadı");

        await new Promise(resolve => setTimeout(resolve, 500));
        const downloadUrl = await getDownloadUrl(videoId);
        if (!downloadUrl) throw new Error("İndirme linki oluşturulamadı");

        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, youtubeId: videoId, downloadUrl, status: "ready" as const } : t
          )
        );
      } catch (err: any) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, status: "error" as const, error: err.message } : t
          )
        );
      }
    }
    setProcessing(false);
  };

  const handleDownload = useCallback((track: Track) => {
    if (!track.downloadUrl) return;
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, status: "downloading" as const } : t))
    );

    const a = document.createElement("a");
    a.href = track.downloadUrl;
    a.download = `${track.artist} - ${track.name}.mp3`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, status: "done" as const } : t))
      );
    }, 1500);
  }, []);

  const handleDownloadAll = () => {
    const readyTracks = tracks.filter((t) => t.status === "ready");
    readyTracks.forEach((track, i) => {
      setTimeout(() => handleDownload(track), i * 800);
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Disc3 className="w-8 h-8 text-primary neon-text" />
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground neon-text">
            RVG <span className="text-primary">DOWNLOAD</span> MUSIC
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-display">
              Spotify Playlist Linki
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="https://open.spotify.com/playlist/..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="bg-secondary border-border neon-border focus:ring-primary"
              />
              <Button
                onClick={handleFetchPlaylist}
                disabled={loading || !playlistUrl.trim()}
                className="neon-glow font-display tracking-wide shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                <span className="hidden sm:inline">{loading ? "Yükleniyor..." : "Şarkıları Getir"}</span>
              </Button>
            </div>
          </div>

          {/* Track List */}
          {tracks.length > 0 && (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">{tracks.length}</span> şarkı •{" "}
                  <span className="text-primary font-semibold">{readyCount}</span> hazır •{" "}
                  <span className="text-neon-purple font-semibold">{doneCount}</span> indirildi
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcessAll}
                    disabled={processing || tracks.every(t => t.status !== "pending")}
                    className="neon-glow font-display text-xs tracking-wide"
                    size="sm"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                    {processing ? "İşleniyor..." : "Şarkıları İşle"}
                  </Button>
                  <Button
                    onClick={handleDownloadAll}
                    disabled={readyCount === 0}
                    className="neon-glow font-display text-xs tracking-wide"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    İndir ({readyCount})
                  </Button>
                </div>
              </div>

              {/* Progress */}
              {processing && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2 bg-secondary [&>div]:bg-primary" />
                  <p className="text-xs text-muted-foreground">Şarkılar işleniyor...</p>
                </div>
              )}

              {/* Table */}
              <div className="rounded-lg border border-border/50 neon-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-14"></TableHead>
                      <TableHead className="font-display text-xs tracking-wider">ŞARKI</TableHead>
                      <TableHead className="font-display text-xs tracking-wider">SANATÇI</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">SÜRE</TableHead>
                      <TableHead className="font-display text-xs tracking-wider">DURUM</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tracks.map((track) => (
                      <TrackRow key={track.id} track={track} onDownload={handleDownload} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {tracks.length === 0 && !loading && (
            <div className="text-center py-20 space-y-4">
              <Disc3 className="w-16 h-16 mx-auto text-muted-foreground/30 animate-pulse-neon" />
              <p className="text-muted-foreground text-lg">
                Spotify playlist linkini yapıştır ve şarkıları indir
              </p>
              <p className="text-muted-foreground/60 text-sm">
                DJ setlerin için ihtiyacın olan tüm müzikleri tek tuşla indir
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground/50 font-display tracking-wider">
          RVG DOWNLOAD MUSIC AUTOMATION © 2026
        </p>
      </footer>
    </div>
  );
};

export default Index;
