import React from 'react';
import '../styles/Modal.css';

const BlogModal = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>X</button>
        
        {topic.image && (
          <img src={topic.image} alt="Header" className="modal-image" />
        )}
        
        <span className="card-tag">{topic.category?.toUpperCase()}</span>
        <h1 style={{ color: 'var(--primary)', margin: '15px 0' }}>{topic.title}</h1>
        
        <div className="modal-body">
          {topic.content}
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
