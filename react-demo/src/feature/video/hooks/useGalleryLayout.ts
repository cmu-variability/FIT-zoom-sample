import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { getVideoLayout } from '../video-layout-helper';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useParticipantsChange } from './useParticipantsChange';
import { useAuth } from '../../../authContext'; // Adjust the path as per your directory structure
import { onShowResearcherChange } from '../../../firebaseConfig';
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  pagination: Pagination
) {

  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }
  const [isShowingResearcher, setIsShowingResearcher] = useState(false); // Default to true or as per your requirement

  const authContext = useAuth();
  if (!authContext) {
    // Handle the case where auth context is null. For example:
    return {
      visibleParticipants,
      layout
    };
  }
  const { loggedInUsername, setLoggedInUsername, userGroup, setUserGroup, isResearcher, setIsResearcher, researcher, setResearcher } = authContext;

  // useEffect(() => {
  //   let unsubscribe: () => void; // Explicitly typing unsubscribe as a function that returns nothing
  //   if (authContext?.userGroup) {
  //     console.log(`Subscribing to showResearcher changes for group: ${authContext.userGroup}`);
  //     // Assuming `onShowResearcherChange` is properly typed to return a () => void function
  //     unsubscribe = onShowResearcherChange(userGroup, (newValue: boolean) => {
  //       setIsShowingResearcher((currentValue) => {
  //         console.log(`Changing from ${currentValue} to ${newValue}`);
  //         console.log(isShowingResearcher)
  //         return newValue;
  //       });
  //     });
  //   }
  
  //   // Cleanup function
  //   return () => {
  //     if (unsubscribe) {
  //       console.log(`Unsubscribing from showResearcher changes for group: ${authContext?.userGroup}`);
  //       unsubscribe();
  //     }
  //   };
  // }, [authContext?.userGroup]); // Ensuring dependencies are correctly listed

  // useEffect(() => {
  //   console.log(`isShowingResearcher updated to: ${isShowingResearcher}`);
  //   // Handle any side effects or operations needed after state updates
  // }, [isShowingResearcher]);

  useEffect(() => {
    setLayout(getVideoLayout(dimension.width, dimension.height, size));
  }, [dimension, size]);

  const onParticipantsChange = useCallback(
    (participants: Participant[]) => {
      const currentUser = zmClient.getCurrentUserInfo();
      if (currentUser && participants.length > 0) {
        let pageParticipants: Participant[] = [];
        if (participants.length === 1) {
          pageParticipants = participants;
        } else {
          pageParticipants = participants
            .filter((user) => user.userId !== currentUser.userId)
            .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
          pageParticipants.splice(1, 0, currentUser);
          pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
        }

        pageParticipants = pageParticipants.filter((participant) => {
          // if (participant.displayName === 'researcher' && !isShowingResearcher) {
          //   // Modify or exclude participant based on your requirement
          //   return false; // Exclude
          // }
          if (participant.displayName === 'researcher') {
            // Modify or exclude participant based on your requirement
            return false; // Exclude
          }
          return true;
        });

        setVisibleParticipants(pageParticipants);

        const videoParticipants = pageParticipants.filter((user) => (user.bVideoOn)).map((user) => user.userId);
        setSubscribedVideos(videoParticipants);
      }
    },
    [zmClient, page, pageSize]
  );
  useParticipantsChange(zmClient, onParticipantsChange);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
    zmClient.getCurrentUserInfo()?.userId
  );
  return {
    visibleParticipants,
    layout
  };
}
