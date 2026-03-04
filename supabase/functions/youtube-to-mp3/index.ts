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
    const { videoId } = await req.json();
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Video ID gerekli" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(JSON.stringify({ error: "RapidAPI anahtarı ayarlanmamış" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Using youtube-mp36 API on RapidAPI
    const res = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
      {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
        },
      }
    );

    const data = await res.json();

    if (data.status === "ok" && data.link) {
      return new Response(JSON.stringify({ downloadUrl: data.link }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: data.msg || "MP3 dönüştürme başarısız" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
