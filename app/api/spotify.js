import axios from "axios";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  TOKEN_URL,
  REDIRECT_URI,
} from "../constants/apiConstants";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

// Spotify'dan Access Token almak için Client Credentials Flow
export const getAccessToken = async () => {
  const authParameters = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
  };

  try {
    const response = await fetch(TOKEN_URL, authParameters);
    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Error fetching access token:", data);
      throw new Error("Failed to retrieve access token");
    }
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
};

// Spotify API üzerinden sanatçı aramak
export const searchArtists = async (token, query, offset = 0) => {
  const url = `${SPOTIFY_API_URL}/search?q=${query}&type=artist&limit=10&offset=${offset}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.artists.items;
};

// Spotify API üzerinden albüm aramak
export const searchAlbums = async (token, query, offset = 0) => {
  const url = `${SPOTIFY_API_URL}/search?q=${query}&type=album&limit=10&offset=${offset}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.albums.items;
};

export const getArtistAlbums = async (artistId) => {
  const token = await getAccessToken();
  const response = await axios.get(`${SPOTIFY_API_URL}/artists/${artistId}/albums`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.items;
};

// Spotify API üzerinden albümdeki şarkıları çekmek
export const getAlbumTracks = async (albumId) => {
  const token = await getAccessToken();
  const response = await axios.get(`${SPOTIFY_API_URL}/albums/${albumId}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.items;
};