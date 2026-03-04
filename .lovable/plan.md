

# RVG Download Music Automation

## Uygulama Özeti
DJ'ler için Spotify playlist linkini yapıştırarak şarkıları MP3 olarak indirmeye yarayan bir web uygulaması.

## Akış
1. Kullanıcı Spotify playlist linkini yapıştırır
2. Sistem playlist'teki şarkıları listeler (şarkı adı, sanatçı, albüm kapağı)
3. Her şarkı için YouTube'da otomatik arama yapılır
4. Bulunan YouTube videoları 3. parti API ile MP3'e dönüştürülür
5. Kullanıcı tek tek veya toplu indirme yapabilir

## Sayfalar & UI

### Ana Sayfa
- Koyu/DJ temalı tasarım (karanlık arka plan, neon vurgular)
- "RVG Download Music Automation" logosu/başlığı
- Spotify playlist link input alanı + "Şarkıları Getir" butonu
- Şarkı listesi tablosu: kapak resmi, şarkı adı, sanatçı, süre, durum (bekliyor/hazır/indiriliyor)
- Her şarkı için "İndir" butonu + üstte "Tümünü İndir" butonu
- İndirme ilerleme çubuğu

## Backend (Supabase Edge Functions)

### 1. spotify-playlist Edge Function
- Spotify API ile playlist bilgilerini çeker (şarkı adları, sanatçılar)
- Spotify Client ID & Secret gerekli (kullanıcıdan alınacak)

### 2. youtube-search Edge Function  
- Her şarkı için YouTube Data API v3 ile arama yapar
- YouTube API key gerekli

### 3. youtube-to-mp3 Edge Function
- RapidAPI üzerindeki bir YouTube-to-MP3 servisi kullanarak MP3 indirme linki üretir
- RapidAPI key gerekli

## Gerekli API Anahtarları
- Spotify Client ID & Client Secret
- YouTube Data API v3 Key
- RapidAPI Key (YouTube MP3 converter servisi için)

## Teknoloji
- Lovable Cloud ile Supabase Edge Functions
- React frontend, koyu DJ teması
- Toplu indirme desteği

