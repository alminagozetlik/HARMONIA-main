// Buradaki bilgiler demo süreci için. Üretim ortamında backend'e aktarılmalıdır.
export const CLIENT_ID = "c29f3e5c73044b5dbaee942984894ce5";
export const CLIENT_SECRET = "9a3285432fa3464f82c08cbaaf2d476e";
export const REDIRECT_URI = "exp://192.168.1.23:8081"; // Geliştirme sırasında kullanılması gereken URI, üretimde değiştirilmelidir
export const AUTH_URL = "https://accounts.spotify.com/authorize";
export const TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SCOPES = "user-library-read playlist-read-private user-top-read";
