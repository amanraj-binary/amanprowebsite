import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { ref, push, remove, onValue, runTransaction } from "firebase/database";

const PostInteractions = ({ postId, type, isAdmin, username }) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const user = auth.currentUser;

  useEffect(() => {
    const interRef = ref(db, `interactions/${postId}`);
    onValue(interRef, (snapshot) => {
      const data = snapshot.val() || {};
      // लाइक्स काउंट
      const likeData = data.likes || {};
      setLikes(Object.keys(likeData).length);
      setHasLiked(!!likeData[user?.uid]);

      // कमेंट्स लिस्ट
      const commentData = data.comments || {};
      const list = Object.entries(commentData).map(([id, val]) => ({ id, ...val }));
      setComments(list.sort((a, b) => b.timestamp - a.timestamp));
    });
  }, [postId, user]);

  const toggleLike = () => {
    if (!user) return alert("Please Login to Like!");
    const likeRef = ref(db, `interactions/${postId}/likes/${user.uid}`);
    if (hasLiked) remove(likeRef);
    else push(likeRef, true); // सरल तरीके के लिए
  };

  const postComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    const commentRef = ref(db, `interactions/${postId}/comments`);
    push(commentRef, {
      uid: user.uid,
      username: username || "GUEST_USER", // प्रोफाइल से यूजरनेम
      text: newComment,
      timestamp: Date.now(),
      isAdmin: isAdmin // एडमिन टैग के लिए
    });
    if (!isAdmin) { // खुद के कमेंट पर नोटिफिकेशन न आए
  const notifRef = ref(db, `notifications/`);
  push(notifRef, {
    type: 'COMMENT',
    postId: postId,
    username: username || "GUEST",
    text: newComment.substring(0, 30) + "...", // छोटा प्रीव्यू
    timestamp: Date.now(),
    read: false
  });
}
    setNewComment("");
  };

  return (
    <div className="interaction-box">
      <div className="action-bar">
        <button className={`like-btn ${hasLiked ? 'active' : ''}`} onClick={toggleLike}>
          {hasLiked ? '❤️' : '🤍'} {likes}
        </button>
        <span className="comment-count">💬 {comments.length}</span>
      </div>

      <div className="comment-section">
        <form onSubmit={postComment} className="comment-input-row">
          <input 
            className="cyber-input" 
            placeholder="Add a transmission..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </form>

        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <span className={`comment-user ${c.isAdmin ? 'royal-tag' : ''}`}>
                   {c.isAdmin ? '👑 ' : ''}{c.username}
                </span>
                {isAdmin && (
                  <button className="delete-comment" onClick={() => remove(ref(db, `interactions/${postId}/comments/${c.id}`))}>×</button>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostInteractions;
