// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs, getDoc, updateDoc, arrayRemove, arrayUnion, addDoc, query, onSnapshot, orderBy, deleteDoc, serverTimestamp, FirestoreError } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from 'moment-timezone';

import firebaseConfig from './firebaseSecret';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const checkLoginCredentials = async (username: string, password: string) => {
  try {
      const userDocRef = doc(firestore, `Users/${username}`);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === password) {
          return { valid: true, group: userData.group, isResearcher: userData.isResearcher, researcher: userData.researcher };
        }
      }
      return { valid: false };
    } catch (error) {
      console.error('Error checking login credentials:', error);
      return { valid: false };
    }
  };

  export const updateUserGroup = async (username: string | null) => {
    try {
      const userDocRef = doc(firestore, `Users/${username}`);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.nextGroup) {
          await updateDoc(userDocRef, {
            group: userData.nextGroup
          });
          return { success: true, message: "User group updated successfully." };
        } else {
          return { success: false, message: "Next group field is empty." };
        }
      } else {
        return { success: false, message: "User not found." };
      }
    } catch (error) {
      // Check if error is an instance of Error
      if (error instanceof Error) {
        console.error('Error updating user group:', error);
        return { success: false, message: error.message };
      } else {
        // Handle the case where the error is not an Error instance
        console.error('An unknown error occurred:', error);
        return { success: false, message: 'An unknown error occurred' };
      }
    }
  };

  export const fetchNextUserGroup = async (username: string | null) => {
    try {
      // Reference to the specific user document
      const userDocRef = doc(firestore, `Users/${username}`);
      
      // Fetch the document
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        // Get the data from the document
        const userData = userDoc.data();
        
        // Check if nextGroup field exists
        if ('nextGroup' in userData) {
          return { success: true, nextUserGroup: userData.nextGroup };
        } else {
          throw new Error('nextGroup field does not exist for this user');
        }
      } else {
        throw new Error(`User document for ${username} does not exist`);
      }
    } catch (error) {
      console.error("Error fetching next user group:", error);
      return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
    }
  };

  export interface FetchCurrentMeetingsResponse {
    success: boolean;
    meetings?: { [key: string]: any }[]; // Array of objects with document ID as key
    message?: string;
  }

  export interface Meeting {
    id: string;
    users: Array<any>; // Replace `any` with a more specific type if possible
    videoId: string;
    chats: Array<any>; // Replace `any` with a more specific type if possible
  }

  export const fetchCurrentMeetings = async () => {
    try {
      const meetingsCollectionRef = collection(firestore, "currentMeetings");
      const querySnapshot = await getDocs(meetingsCollectionRef);
      const meetings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, meetings };
    } catch (error) {
      console.error("Error fetching current meetings:", error);
      return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
    }
  };

export const deleteCurrentMeeting = async (roomId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const roomRef = doc(firestore, "currentMeetings", roomId);
    await deleteDoc(roomRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting room:", error);
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
  }
};


export const createNewMeetingRoom = async (roomID: string) => {
  try {
    // Create a reference to a new document in 'currentMeetings' collection with the specified roomID
    const roomRef = doc(collection(firestore, 'currentMeetings'), roomID);

    // Set the initial data for the new meeting room
    await setDoc(roomRef, {
      alert: "welcome to the call, we will alert you when everything is ready!",
      chats: [],
      users: [],
      videoId: '', // Set an initial or default value as appropriate
    });

    console.log('Meeting room created successfully with ID:', roomID);
  } catch (error) {
    console.error('Error creating meeting room:', error);
    throw error; // Rethrow the error for caller handling, if necessary
  }
};


export const haveUserLeaveRoom = async (username: string | null, group: string) => {
  try {
      // Reference to the specific group document
      const groupDocRef = doc(firestore, `currentMeetings/${group}`);

      // Remove the user from the users array in the group document
      await updateDoc(groupDocRef, {
          users: arrayRemove(username)
      });

      console.log(`User ${username} removed from group ${group}`);
      return { success: true, message: `User ${username} removed from group ${group}` };
  } catch (error) {
      console.error("Error removing user from group:", error);
      return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
  }
};


export const haveUserJoinRoom = async (username : string | null, group: string) => {
  try {
      // Reference to the specific group document
      const groupDocRef = doc(firestore, `currentMeetings/${group}`);

      // Add the user to the users array in the group document
      await updateDoc(groupDocRef, {
          users: arrayUnion(username)
      });

      console.log(`User ${username} added to group ${group}`);
      return { success: true, message: `User ${username} added to group ${group}` };
  } catch (error) {
      console.error("Error adding user to group:", error);
      return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
  }
};


export const createVideoReference = async (userId: any) => {
  const videoRef = doc(collection(firestore, 'videos'));

  const callStartTime = moment().tz('America/New_York').format();

  await setDoc(videoRef, {
    userId,
    callStartTime,
    criticalMoments: []
  });
  console.log('Video reference created with ID:', videoRef.id);
  return videoRef.id; // Return the newly created document ID
};

export const uploadVideo = async (videoId: any, videoFile: any) => {
  if (!videoId) {
    throw new Error("videoId is required but was not provided.");
  }

  const storage = getStorage();
  const videoRef = ref(storage, `videos/${videoId}`); // Use the video document ID as the storage reference

  await uploadBytes(videoRef, videoFile);
  const downloadURL = await getDownloadURL(videoRef);

  const callEndTime = moment().tz('America/New_York').format();

  console.log("downloadURL: ", downloadURL);
  // Update the Firestore document with the video path
  const docRef = doc(firestore, 'videos', videoId);
  await updateDoc(docRef, {
    videoURL: downloadURL,
    videoStorageId: videoId,
    callEndTime: callEndTime
  });

  return downloadURL; // Return the download URL
};

export interface CriticalMoment {
  username: string;
  isResearcher: boolean;
  time: number; // Storing time as Unix timestamp in milliseconds
  category: string;
  comment: string;
}


export const markCriticalMoment = async (
  username: string,
  isResearcher: boolean,
  currentVideoId: string | null,
  category: string, // Added category parameter
  comment: string
): Promise<void> => {
  try {
    console.log("Trying to mark a critical moment");

    if (!currentVideoId) {
      console.error("No video ID provided");
      return;
    }

    // Construct the document path using the currentVideoId
    const videoRef = doc(firestore, `videos/${currentVideoId}`);

    // Fetch the video document to get the start time
    const videoDoc = await getDoc(videoRef);
    if (!videoDoc.exists()) {
      console.error("Video document does not exist");
      return;
    }
    const videoData = videoDoc.data();
    const callStartTime = videoData.callStartTime;
    if (!callStartTime) {
      console.error("Start time not found for the video");
      return;
    }

    // Convert callStartTime to moment object for calculation
    const callStartMoment = moment(callStartTime);
    // Calculate the time elapsed since the video started in milliseconds
    const currentTime = moment();
    const elapsedTime = currentTime.diff(callStartMoment);

    // Create a CriticalMoment object with the elapsed time and the new category
    const criticalMoment: CriticalMoment = {
      username,
      isResearcher,
      time: elapsedTime, // Elapsed time in milliseconds from the start of the video
      category, // Include the category in the critical moment
      comment,
    };

    // Append the new critical moment to the 'criticalMoments' array for the video document
    await updateDoc(videoRef, {
      criticalMoments: arrayUnion(criticalMoment)
    });

    console.log("Critical moment marked successfully.");
  } catch (error) {
    console.error("Error marking critical moment:", error);
    throw error; // Rethrow the error for caller handling, if necessary
  }
};


export interface VideoData {
  videoStorageId?: string;
  startTime?: any; // Consider using a more specific type here if possible, e.g., number for timestamp or Date
  videoURL?: string; // Assuming this should be a string URL
  callStartTime?: any; // Same note on specific typing as above
  criticalMoments: CriticalMoment[];
  videoId?: string;
  chat?: Array<any>; // Define a more specific type if your chat items have a known structure
}

export const fetchVideoData = async (videoIndex: string): Promise<VideoData | null> => {
  const videoRef = doc(firestore, `videos/${videoIndex}`);
  const videoDoc = await getDoc(videoRef);

  if (videoDoc.exists()) {
    const data = videoDoc.data();

    // Providing a default value for criticalMoments if it does not exist.
    const criticalMoments = data.criticalMoments || [];
    const chat = data.chat || []; // Defaulting to an empty array if chat does not exist

    // Constructing the VideoData object with all required properties, including chat.
    const videoData: VideoData = {
      videoId: videoDoc.id, // Assuming you want to include the document ID as videoId
      criticalMoments,
      videoURL: data.videoURL,
      // Add chat to the constructed object
      chat,
      // Include other data properties as needed
    };

    return videoData;
  } else {
    console.log("No video data found for:", videoIndex);
    return null;
  }
};

export const fetchAllVideos = async (): Promise<VideoData[]> => {
  try {
    const q = query(collection(firestore, "videos"));
    const querySnapshot = await getDocs(q);
    const videos: VideoData[] = querySnapshot.docs.map(doc => {
      // Assuming the rest of the document data aligns with the VideoData type
      return {
        id: doc.id, // Use 'id' to store the document ID
        ...doc.data() as Omit<VideoData, 'id'>, // Spread the rest of the document data
      };
    });
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error; // Rethrow the error for handling elsewhere
  }
};

export const addChatMessage = async (userGroup: string, message: string, username: string) => {
  const meetingDocRef = doc(firestore, `currentMeetings/${userGroup}`);
  try {
    // Update the 'chats' array in the document
    await updateDoc(meetingDocRef, {
      chats: arrayUnion({
        text: message,
        user: username,
        timestamp: new Date().toISOString(),
        isSent: true,
      }),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};


// Function to fetch chat messages from an array in a Firestore document
export const onChatMessagesSnapshot = (userGroup: string, callback: Function) => {
  const meetingDocRef = doc(firestore, `currentMeetings/${userGroup}`);
  return onSnapshot(meetingDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const messages = data.chats || [];
      callback(messages);
    } else {
      console.log('No chat document found for the user group:', userGroup);
    }
  });
};

export interface User {
  id: string;
  group: string;
  nextGroup: string;
  password: string;
  isResearcher: boolean;
}

export const fetchUsers = async (): Promise<User[]> => {
  const usersCol = collection(firestore, 'Users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(doc => {
    const userData = doc.data();
    return {
      id: doc.id,
      group: userData.group,
      nextGroup: userData.nextGroup,
      password: userData.password,
      isResearcher: userData.isResearcher
    } as User;
  });
};

export interface UserData {
  group: string;
  isResearcher: boolean;
  nextGroup: string;
  password: string;
}

export const fetchUserData = async (userId: string): Promise<UserData | undefined> => {
  const docRef = doc(firestore, 'Users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  } else {
    console.log('No such document!');
    return undefined;
  }
};

export interface UserData2 {
  id: string; // Assuming the document name will be stored as 'id'
  group: string;
  isResearcher: boolean;
  nextGroup: string;
  password: string;
}

export const updateUser = async (userId: string, editData: UserData): Promise<void> => {
  try {
    const userRef = doc(firestore, 'Users', userId); // Correctly obtain a document reference
    await updateDoc(userRef, {
      group: editData.group,
      isResearcher: editData.isResearcher,
      nextGroup: editData.nextGroup,
      password: editData.password,
    });
    console.log('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error; // Allows error handling in the component
  }
};

export const createUser = async (userData: UserData2): Promise<void> => {
  try {
    // Ensure 'id' is used as the document ID
    await setDoc(doc(firestore, 'Users', userData.id), {
      group: userData.group,
      isResearcher: userData.isResearcher,
      nextGroup: userData.nextGroup,
      password: userData.password,
    });
    console.log('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(firestore, "Users", userId));
    console.log(`User with ID ${userId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
};


export const onVideoIdSnapshot = (
  userGroup: string,
  setCurrentVideoId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const docRef = doc(firestore, "currentMeetings", userGroup);

  return onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Update state with the new videoId, or null if it doesn't exist
      setCurrentVideoId(data.videoId || null);
    } else {
      // Document does not exist, might want to handle this case in your application
      console.log(`No currentMeeting document found for userGroup: ${userGroup}`);
      setCurrentVideoId(null);
    }
  }, (error) => {
    // Handle any errors that occur during the snapshot
    console.error("Error fetching videoId:", error);
    setCurrentVideoId(null); // Optionally reset or handle state on error
  });
};


export const updateVideoIdInMeeting= async (documentId: string, videoId: string): Promise<void> => {
  const docRef = doc(firestore, "currentMeetings", documentId);
  console.log("inside the firebase function: ", documentId, videoId);
  try {
    await updateDoc(docRef, {
      videoId: videoId
    });
    console.log(`Successfully updated videoId to "${videoId}" for documentId: ${documentId}`);
  } catch (error) {
    console.error("Error updating videoId:", error);
    throw error; // Rethrow to let calling code handle it
  }
};

export const createAlert = async ( meetingId: string, alertMessage: any ) => {
  const meetingRef = doc(firestore, 'currentMeetings', meetingId);

  try {
    await updateDoc(meetingRef, {
      alert: alertMessage,
    });
    console.log('Alert message updated successfully');
  } catch (error) {
    console.error('Error updating alert message:', error);
    throw error; // Rethrow the error so it can be caught and logged in the component
  }
};

export const onAlertMessageChange = (meetingId: string, callback: any) => {
  const meetingRef = doc(firestore, 'currentMeetings', meetingId);

  // Listen for changes in the document
  const unsubscribe = onSnapshot(meetingRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.alert) {
        callback(data.alert); // Execute callback with the new alert message
      } else {
        callback(''); // Clear the alert message if it's removed
      }
    }
  }, (error) => {
    console.error('Error listening for alert message changes:', error);
    callback(''); // Consider clearing the message or handling the error
  });

  // Return the unsubscribe function to stop listening when the component unmounts
  return unsubscribe;
};

export const showResearcherInRoom = async (roomId: any) => {
  const roomRef = doc(firestore, "currentMeetings", roomId);
  await updateDoc(roomRef, {
      showResearcher: true
  });
};

/**
* Function to hide the researcher from the room.
* @param {string} roomId The ID of the room to update.
*/
export const hideResearcherInRoom = async (roomId: any) => {
  const roomRef = doc(firestore, "currentMeetings", roomId);
  await updateDoc(roomRef, {
      showResearcher: false
  });
};

export const onShowResearcherChange = (userGroupId: string, onChange: any) => {
  const userGroupRef = doc(firestore, "currentMeetings", userGroupId);

  return onSnapshot(userGroupRef, (doc) => {
      if (doc.exists()) {
          const data = doc.data();
          onChange(data.showResearcher);
      } else {
          onChange(false); // Assuming false as default if document or field doesn't exist
      }
  });
};


export const fetchCurrentAlertMessage = async (meetingId: string): Promise<string> => {
  const meetingRef = doc(firestore, 'currentMeetings', meetingId);
  try {
    const docSnapshot = await getDoc(meetingRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Return the alert message if it exists; otherwise, return an empty string
      return data.alert || '';
    } else {
      console.log("No such document!");
      return ''; // Return an empty string if the document does not exist
    }
  } catch (error) {
    console.error("Error fetching alert message:", error);
    return ''; // Return an empty string in case of error
  }
};

export const getChatFromMeeting = async (meetingId: string) => {
  try {
    const meetingRef = doc(firestore, 'currentMeetings', meetingId);
    const docSnapshot = await getDoc(meetingRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.chats || [];
    } else {
      console.log("Meeting document does not exist.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching chat from meeting:", error);
    return []; // Return an empty array in case of error
  }
};

export const updateVideoWithChat = async (videoId: string, chatArray: any) => {
  try {
    const videoRef = doc(firestore, 'videos', videoId);
    await updateDoc(videoRef, {
      chat: chatArray
    });
    console.log('Chat array updated successfully in video document.');
  } catch (error) {
    console.error("Error updating video with chat:", error);
    throw new Error('Error updating video with chat'); // Rethrow or handle as needed
  }
};

export const removeChatFromMeeting = async (meetingId: string): Promise<void> => {
  const meetingRef = doc(firestore, "currentMeetings", meetingId);

  try {
    // Here we're setting the chat field to an empty array to "remove" the chat.
    // Adjust this based on how you want to handle the removal.
    await updateDoc(meetingRef, {
      chats: []
    });
    console.log(`Chat removed from meeting ${meetingId} successfully.`);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error("Error removing chat from meeting:", firestoreError);
    throw firestoreError; // Re-throw to allow caller to handle it
  }
};