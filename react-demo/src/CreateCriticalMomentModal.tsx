import React, { useState } from 'react';
import { useModal } from './ModalContext';
import { useAuth } from './authContext';
import { markCriticalMoment } from './firebaseConfig';

const CreateCriticalMomentModal: React.FC<{ currentVideoId: string }> = ({ currentVideoId }) => {
  const { modalStates, setModalState } = useModal();
  const [category, setCategory] = useState(''); // For the dropdown selection
  const [comment, setComment] = useState(''); // For the comment box

  const authContext = useAuth();
  if (!authContext) return null;
  const { loggedInUsername, isResearcher } = authContext;

  const handleSubmit = async () => {
    if (category.trim() !== '' && comment.trim() !== '') {
      try {
        if (loggedInUsername) {
          await markCriticalMoment(loggedInUsername, isResearcher, currentVideoId, category, comment);
        }
        setModalState('createCriticalMomentModal', false); // Close the modal
      } catch (error) {
        console.error('Error marking critical moment:', error);
      }
    }
  };

  return (
    <>
      {modalStates.createCriticalMomentModal && (
        <div style={{ position: 'fixed', top: '10%', right: '10%', backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1050, width: '400px' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <button onClick={() => setModalState('createCriticalMomentModal', false)}>X</button>
          </div>
          <h3 style={{ textAlign: 'left' }}>Mark Critical Moment</h3>
          <div style={{ margin: '10px 0', textAlign: 'left' }}>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ display: 'block', marginBottom: '10px', width: '100%' }}
            >
              <option value="">Select a Category</option>
              <option value="misunderstanding">Misunderstanding</option>
              <option value="Type2">Type 2</option>
              <option value="Type3">Type 3</option>
              {/* Add more categories as needed */}
            </select>
          </div>
          <div style={{ margin: '10px 0', textAlign: 'left' }}>
            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>
          <button onClick={handleSubmit} style={{ marginTop: '10px' }}>Submit</button>
        </div>
      )}
    </>
  );
};

export default CreateCriticalMomentModal;
