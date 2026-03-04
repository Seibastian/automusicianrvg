import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistUrl } = await req.json();
    if (!playlistUrl) {
      return new Response(JSON.stringify({ error: "Playlist URL gerekli" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract playlist ID from URL
    const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Geçersiz Spotify playlist linki" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const playlistId = match[1];

    // Get Spotify access token
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Spotify API anahtarları ayarlanmamış" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: "Spotify token alınamadı" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch playlist tracks (up to 100)
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists(name),album(name,images),duration_ms))`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    if (!playlistRes.ok) {
      return new Response(JSON.stringify({ error: "Playlist bulunamadı veya erişilemiyor" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const playlistData = await playlistRes.json();

    const tracks = (playlistData.items || [])
      .filter((item: any) => item.track)
      .map((item: any) => {
        const t = item.track;
        const mins = Math.floor(t.duration_ms / 60000);
        const secs = Math.floor((t.duration_ms % 60000) / 1000);
        return {
          id: t.id,
          name: t.name,
          artist: t.artists.map((a: any) => a.name).join(", "),
          album: t.album.name,
          albumArt: t.album.images?.[1]?.url || t.album.images?.[0]?.url || "",
          duration: `${mins}:${secs.toString().padStart(2, "0")}`,
        };
      });

    return new Response(JSON.stringify({ tracks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
