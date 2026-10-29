import React, { useState } from 'react';
import { FeedPost, PostType } from '../types';
import { ic } from '../../../components/icons';

const PT: Record<PostType, [string, string]> = {
  Kudos: ['star', '#D99A00'],
  Update: ['chat', '#0BA6CC'],
  Announcement: ['mega', '#D9466F'],
  Welcome: ['gift', '#12A58E'],
  Celebration: ['gift', '#7C5CFF'],
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = ['#0B6FDB', '#12A58E', '#7C5CFF', '#D9466F', '#E07A1D', '#0BA6CC', '#6366F1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

interface PostCardProps {
  post: FeedPost;
  currentUser: string;
  deptText?: string;
  onLike: (id?: string) => void;
  onAddComment: (text: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post: p,
  currentUser,
  deptText = 'Brightcone',
  onLike,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [iconName, color] = PT[p.type] || PT.Update;
  const liked = p.likes.includes(currentUser);

  const handleCommentSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      onAddComment(commentInput.trim());
      setCommentInput('');
    }
  };

  return (
    <article className="card post mt">
      <header>
        <div className="who">
          <span className="av" style={{ backgroundColor: getAvatarColor(p.by) }}>
            {getInitials(p.by)}
          </span>
          <div>
            <b>{p.by}</b>
            <span>{`${p.d} · ${deptText}`}</span>
          </div>
        </div>
        <span className="ptag" style={{ '--c': color } as React.CSSProperties}>
          {ic(iconName, 14)}
          {p.type}
        </span>
      </header>

      {p.to && (
        <div className="kudo" style={{ '--c': color } as React.CSSProperties}>
          <span className="av" style={{ backgroundColor: getAvatarColor(p.to) }}>
            {getInitials(p.to)}
          </span>
          <div>
            <span>
              {p.type === 'Kudos'
                ? 'Kudos to'
                : p.type === 'Welcome'
                ? 'Welcome to the team'
                : 'Celebrating'}
            </span>
            <b>{p.to}</b>
          </div>
        </div>
      )}

      <p className="whitespace-pre-line">{p.t}</p>

      <footer>
        <button
          type="button"
          className={`pbtn ${liked ? 'on' : ''}`}
          onClick={() => onLike(p.id)}
          aria-pressed={liked}
        >
          {ic('thumb', 16)}
          {p.likes.length ? `${p.likes.length} ` : ''}
          {p.likes.length === 1 ? 'Like' : 'Likes'}
        </button>
        <button
          type="button"
          className="pbtn"
          onClick={() => {
            const el = document.getElementById(`c_${p.id}`);
            el?.focus();
          }}
        >
          {ic('chat', 16)}
          {p.comments.length} comment{p.comments.length === 1 ? '' : 's'}
        </button>
      </footer>

      {p.comments.map((c, idx) => (
        <div key={idx} className="cmt">
          <span className="av" style={{ backgroundColor: getAvatarColor(c.by) }}>
            {getInitials(c.by)}
          </span>
          <div>
            <b>{c.by}</b> {c.t}
          </div>
        </div>
      ))}

      <div className="cmt-in">
        <span className="av" style={{ backgroundColor: getAvatarColor(currentUser) }}>
          {getInitials(currentUser)}
        </span>
        <input
          id={`c_${p.id}`}
          className="input flex-1"
          placeholder="Write a comment and press Enter"
          aria-label="Comment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={handleCommentSubmit}
        />
      </div>
    </article>
  );
};

export default PostCard;
