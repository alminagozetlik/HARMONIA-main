import axios from "axios";

const API_GATEWAY_URL = "http://172.20.10.2:8765";

const searchPeople = async (username) => {
  try {
    const response = await axios.post(
      `${API_GATEWAY_URL}/search-profile/search`,
      null,
      {
        params: { username },
      }
    );
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ People Search Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Kullanıcı profilini getir
const getUserProfile = async (id) => {
  try {
    const response = await axios.get(
      `${API_GATEWAY_URL}/profile-api/get-user-profile/${id}`
    );
    console.log("✅ Fetch User Profile Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Fetch User Profile Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Kullanıcı profilini güncelle
const updateUserProfile = async (id, profileData) => {
  try {
    const response = await axios.put(
      `${API_GATEWAY_URL}/profile-api/update-profile/${id}`,
      profileData
    );
    console.log("✅ Update User Profile Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Update User Profile Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Albüm ID'lerine göre review'ları çek
const getReviewsByAlbumIds = async (albumIds) => {
  try {
    const reviews = [];
    for (const albumId of albumIds) {
      const response = await axios.get(`${API_GATEWAY_URL}/review/get-reviews/spotify/${albumId}`);
      console.log(`✅ Get Reviews for Album ID ${albumId}:`, response.data.content);
      reviews.push(...response.data.content);
    }
    console.log("✅ Get Reviews By Album IDs Response:", reviews);
    return reviews;
  } catch (error) {
    console.error(
      "❌ Get Reviews By Album IDs Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getUserReview = async (userId, spotifyId) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/review/user-review`, {
      params: { userId, spotifyId },
    });
    console.log("✅ Get User Review Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Get User Review Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getAverageRating = async (spotifyId) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/review/calculate/spotify/${spotifyId}/average-rating`);
    console.log(`✅ Get Average Rating for Spotify ID ${spotifyId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Get Average Rating Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export {
  searchPeople,
  getUserProfile,
  updateUserProfile,
  getReviewsByAlbumIds,
  getUserReview,
  getAverageRating,
};
