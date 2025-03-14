import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Alert } from "react-native";
import { getArtistAlbums, getAlbumTracks } from "../../../api/spotify";
import { saveAlbumRating, getAlbumRating, getReviewsByAlbumIds, getUserProfile, getAverageRating, isReviewLikedByUser, unlikeReview, likeReview } from "../../../api/backend";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

export default function ArtistProfile({ artistName, artistImage, artistId, onBack }) {
const [albums, setAlbums] = useState([]);
const [ratings, setRatings] = useState({});
const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [likedReviews, setLikedReviews] = useState({});
const [usernames, setUsernames] = useState({});
const [selectedTab, setSelectedTab] = useState("Profile");
const [selectedAlbum, setSelectedAlbum] = useState(null);
const [tracks, setTracks] = useState([]);
const [averageRatings, setAverageRatings] = useState({});

const userId = 4; // Hardcoded userId for the current user

useEffect(() => {
const fetchAlbums = async () => {
    try {
    const albumsData = await getArtistAlbums(artistId);
    setAlbums(albumsData);
    fetchAverageRatings(albumsData);
    } catch (error) {
    console.error("Error fetching albums:", error);
    }
};

const fetchAverageRatings = async (albums) => {
    try {
    const ratingsData = {};
    for (const album of albums) {
        const averageRating = await getAverageRating(album.id);
        console.log(`Average rating for album ${album.id}:`, averageRating); // Debug log
        ratingsData[album.id] = averageRating;
    }
    setAverageRatings(ratingsData);
    } catch (error) {
    console.error("Error fetching average ratings:", error);
    }
};

fetchAlbums();
}, [artistId]);

const fetchReviews = useCallback(async () => {
try {
    setLoading(true);
    const albumIds = albums.map((album) => album.id);
    const reviewsData = await getReviewsByAlbumIds(albumIds);
    setReviews(reviewsData);
    fetchUsernames(reviewsData);
    fetchLikedReviews(reviewsData);
} catch (error) {
    console.error("Error fetching reviews:", error);
} finally {
    setLoading(false);
    setRefreshing(false);
}
}, [albums]);

useEffect(() => {
if (selectedTab === "Review") {
    fetchReviews();
}
}, [selectedTab, fetchReviews]);

const fetchUsernames = async (reviews) => {
try {
    const usernamesData = {};
    for (const review of reviews) {
    const userProfile = await getUserProfile(review.userId);
    usernamesData[review.userId] = userProfile.username;
    }
    setUsernames(usernamesData);
} catch (error) {
    console.error("Error fetching usernames:", error);
}
};

const fetchLikedReviews = async (reviews) => {
try {
    const likedReviewsData = {};
    for (const review of reviews) {
    const response = await isReviewLikedByUser(review.id, userId);
    likedReviewsData[review.id] = response.liked;
    }
    setLikedReviews(likedReviewsData);
} catch (error) {
    console.error("Error fetching liked reviews:", error);
}
};

const fetchAlbumTracks = async (albumId) => {
try {
    const tracksData = await getAlbumTracks(albumId);
    setTracks(tracksData);
} catch (error) {
    console.error("Error fetching album tracks:", error);
}
};

const handleAlbumPress = (albumId) => {
if (selectedAlbum === albumId) {
    setSelectedAlbum(null);
    setTracks([]);
} else {
    setSelectedAlbum(albumId);
    fetchAlbumTracks(albumId);
}
};

const toggleLike = async (reviewId) => {
try {
    setLikedReviews((prev) => ({
    ...prev,
    [reviewId]: !prev[reviewId], // Anında UI güncellemesi
    }));

    if (likedReviews[reviewId]) {
    const response = await unlikeReview(reviewId);
    if (response.status !== 200) {
        setLikedReviews((prev) => ({
        ...prev,
        [reviewId]: true, // Eğer hata olursa eski duruma getir
        }));
        if (response.status === 404) {
        console.error("❌ Error unliking review: Like not found.");
        } else {
        console.error("❌ Error unliking review:", response.data.message);
        }
    }
    } else {
    const response = await likeReview(reviewId);
    if (response.status !== 200) {
        setLikedReviews((prev) => ({
        ...prev,
        [reviewId]: false, // Eğer hata olursa eski duruma getir
        }));
        if (response.status === 500) {
        console.error("❌ Error liking review: Internal Server Error while adding the like.");
        } else {
        console.error("❌ Error liking review:", response.data.message);
        }
    }
    }
} catch (error) {
    console.error("Error toggling like:", error);
    Alert.alert("Error", "Something went wrong. Please try again.");
}
};

const getUserRatingForAlbum = (albumId) => {
const userReview = reviews.find(review => review.userId === userId && review.spotifyId === albumId);
return userReview ? userReview.rating : null;
};

const renderAlbum = ({ item }) => {
const userRating = getUserRatingForAlbum(item.id);
const averageRating = averageRatings[item.id];
console.log(`Rendering album ${item.id} with average rating:`, averageRating); // Debug log

const truncateAlbumName = (name) => {
    const words = name.split(" ");
    if (words.length > 3) {
    return words.slice(0, 3).join(" ") + "...";
    }
    return name;
};

return (
    <View style={styles.albumRow}>
    <View style={styles.albumColumn}>
        <TouchableOpacity onPress={() => handleAlbumPress(item.id)}>
        <View style={styles.albumContainer}>
            <Image source={{ uri: item.images[0].url }} style={styles.albumImage} />
            <View style={styles.albumInfo}>
            <Text style={styles.albumName}>{truncateAlbumName(item.name)}</Text>
            <Text style={styles.albumYear}>{item.release_date.split('-')[0]}</Text>
            </View>
        </View>
        </TouchableOpacity>
        {selectedAlbum === item.id && (
        <FlatList
            data={tracks}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id}
            style={styles.trackList}
        />
        )}
    </View>
    <View style={styles.ratingColumn}>
        {userRating ? (
        <View style={styles.ratingContainer}>
            <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                key={star}
                name="star"
                size={14}
                color={star <= userRating ? "yellow" : "gray"}
                />
            ))}
            </View>
        </View>
        ) : (
        <TouchableOpacity style={styles.addButton} onPress={() => { /* Placeholder for future implementation */ }}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
        )}
    </View>
    <View style={styles.communityRatingColumn}>
        {averageRating !== undefined && (
        <Text style={styles.communityRating}>{averageRating ? averageRating.toFixed(1) : "N/A"}</Text>
        )}
    </View>
    </View>
);
};

const renderTrack = ({ item }) => (
<View style={styles.trackContainer}>
    <Text style={styles.trackName}>{item.name}</Text>
</View>
);

const renderReviewCard = ({ item }) => {
const album = albums.find((album) => album.id === item.spotifyId);
const username = usernames[item.userId] || `User ${item.userId}`;
console.log("Usernames state:", usernames);
console.log(`Username for userId ${item.userId}:`, usernames[item.userId]);

return (
    <GestureHandlerRootView>
    <Swipeable overshootRight={false}>
        <View style={styles.reviewContainer}>
        <Image source={{ uri: album?.images[0].url }} style={styles.albumImage} />
        <View style={styles.reviewContent}>
            <Text style={styles.albumName}>{album?.name}</Text>
            <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                key={star}
                name="star"
                size={14}
                color={star <= item.rating ? "white" : "gray"}
                />
            ))}
            </View>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.reviewText}>{item.comment}</Text>
            <View style={styles.reviewFooter}>
            <TouchableOpacity onPress={() => toggleLike(item.id)}>
                <Ionicons 
                name={likedReviews[item.id] ? "heart" : "heart-outline"} 
                size={20} 
                color={likedReviews[item.id] ? "red" : "white"} 
                />
            </TouchableOpacity>
            </View>
        </View>
        </View>
    </Swipeable>
    </GestureHandlerRootView>
);
};

const tabs = ["Profile", "Review", "About"];

return (
<View style={styles.container}>
    <View style={styles.navBar}>
    {tabs.map((tab) => (
        <TouchableOpacity
        key={tab}
        style={[
            styles.navItem,
            selectedTab === tab && styles.selectedNavItem,
        ]}
        onPress={() => setSelectedTab(tab)}
        >
        <Text
            style={[
            styles.navText,
            selectedTab === tab && styles.selectedNavText,
            ]}
        >
            {tab}
        </Text>
        </TouchableOpacity>
    ))}
    </View>
    <Image source={{ uri: artistImage }} style={styles.coverImage} />
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
    <FontAwesome name="arrow-left" size={24} color="white" />
    </TouchableOpacity>
    <View style={styles.profileContainer}>
    <Text style={styles.title}>{artistName}</Text>
    {selectedTab === "Profile" && (
        <>
        <View style={styles.headerRow}>
            <Text style={styles.columnHeader}>Albums/Tracks</Text>
            <Text style={styles.columnHeader}>Your Rating</Text>
            <Text style={styles.columnHeader}>Community Rating</Text>
        </View>
        <FlatList data={albums} renderItem={renderAlbum} keyExtractor={(item) => item.id} />
        </>
    )}
    {selectedTab === "Review" && (
        <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReviews} />}
        renderItem={renderReviewCard}
        />
    )}
    {selectedTab === "About" && (
        <View style={styles.aboutContainer}>
        <Text style={styles.aboutText}>About content goes here...</Text>
        </View>
    )}
    </View>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "black",
},
navBar: {
flexDirection: "row",
justifyContent: "flex-start",
marginTop: 10,
marginBottom: 0,
},
navItem: {
paddingVertical: 5,
paddingHorizontal: 15,
borderRadius: 20,
marginRight: 10,
},
selectedNavItem: {
backgroundColor: "white",
},
navText: {
color: "gray",
fontSize: 16,
},
selectedNavText: {
color: "black",
fontWeight: "bold",
},
coverImage: {
width: "100%",
height: width * 0.6,
},
backButton: {
position: "absolute",
top: 40,
left: 20,
zIndex: 1,
},
profileContainer: {
padding: 20,
},
title: {
color: "white",
fontSize: 24,
fontWeight: "bold",
marginBottom: 10,
},
headerRow: {
flexDirection: "row",
justifyContent: "space-between",
marginBottom: 10,
},
albumRow: {
flexDirection: "row",
alignItems: "flex-start",
marginBottom: 10,
},
albumColumn: {
flex: 2,
},
ratingColumn: {
flex: 1,
alignItems: "center",
},
communityRatingColumn: {
flex: 1,
alignItems: "center",
},
columnHeader: {
color: "lightgray",
fontSize: 14,
fontWeight: "bold",
marginBottom: 5,
marginHorizontal: 10,
},
albumContainer: {
flexDirection: "row",
alignItems: "center",
},
albumImage: {
width: 50,
height: 50,
borderRadius: 10,
marginRight: 10,
},
albumInfo: {
flexDirection: "column",
justifyContent: "center",
},
albumName: {
color: "white",
fontSize: 14,
maxWidth: 150,
},
albumYear: {
color: "gray",
fontSize: 12,
},
userRating: {
color: "yellow",
fontSize: 14,
},
reviewContainer: {
flexDirection: "row",
backgroundColor: "#1E1E1E",
margin: 10,
borderRadius: 10,
padding: 10,
},
reviewContent: {
flex: 1,
marginLeft: 10,
},
userName: {
fontSize: 14,
fontWeight: "bold",
color: "white",
marginTop: 5,
},
reviewText: {
fontSize: 12,
color: "lightgray",
marginTop: 5,
},
reviewFooter: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
marginTop: 8,
},
starPicker: {
flexDirection: "row",
marginTop: 5,
},
aboutContainer: {
padding: 20,
},
aboutText: {
color: "white",
fontSize: 16,
},
trackContainer: {
padding: 5,
},
trackName: {
color: "gray",
fontSize: 14,
},
trackList: {
marginTop: 5,
},
ratingContainer: {
flexDirection: "column",
alignItems: "center",
},
ratingText: {
color: "white",
marginRight: 5,
},
addButton: {
marginTop: 10,
},
communityRating: {
color: "yellow",
fontSize: 14,
},
});
