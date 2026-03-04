import { Download, Loader2, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import type { Track } from "@/types/track";

interface TrackRowProps {
  track: Track;
  onDownload: (track: Track) => void;
}

const statusConfig = {
  waiting: { icon: null, label: "Bekliyor", className: "text-muted-foreground" },
  searching: { icon: Search, label: "Aranıyor...", className: "text-neon-cyan animate-pulse-neon" },
  ready: { icon: Download, label: "Hazır", className: "text-primary" },
  downloading: { icon: Loader2, label: "İndiriliyor...", className: "text-neon-purple animate-spin" },
  done: { icon: CheckCircle, label: "Tamamlandı", className: "text-primary" },
  error: { icon: AlertCircle, label: "Hata", className: "text-destructive" },
};

export function TrackRow({ track, onDownload }: TrackRowProps) {
  const status = statusConfig[track.status];
  const StatusIcon = status.icon;

  return (
    <TableRow className="border-border/50 hover:bg-secondary/50 transition-colors">
      <TableCell className="w-14">
        <img
          src={track.albumArt || "/placeholder.svg"}
          alt={track.album}
          className="w-10 h-10 rounded object-cover"
        />
      </TableCell>
      <TableCell className="font-medium text-foreground">{track.name}</TableCell>
      <TableCell className="text-muted-foreground">{track.artist}</TableCell>
      <TableCell className="text-muted-foreground hidden sm:table-cell">{track.duration}</TableCell>
      <TableCell>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${status.className}`}>
          {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
          {status.label}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant={track.status === "ready" ? "default" : "ghost"}
          disabled={track.status !== "ready"}
          onClick={() => onDownload(track)}
          className={track.status === "ready" ? "neon-glow" : ""}
        >
          <Download className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
