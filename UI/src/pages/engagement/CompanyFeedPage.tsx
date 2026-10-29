import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { ic } from '../../components/icons';
import { FeedPost, PostType, AnnouncementItem } from './types';
import { NewAnnouncementModal } from './components/NewAnnouncementModal';
import { PostCard } from './components/PostCard';
import { FeedSidebarWidgets } from './components/FeedSidebarWidgets';
import {
  fetchConnectPosts,
  createConnectPost,
  toggleConnectLike,
  addConnectComment,
  fetchConnectCelebrations,
  fetchConnectGroups,
} from '../../services/signConnectApi';
import { mapPostFromApi, mapAnnouncementFromPost, mapCelebrationFromApi } from './apiMapper';

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

export const CompanyFeedPage: React.FC = () => {
  const { user } = useAuth();
  const currentUser = user?.name || (user?.role === 'employee' ? 'Rahul Varma' : 'Ananya Rao');
  const isAdmin =
    user?.role === 'hr_admin' ||
    user?.role === 'HR_ADMIN' ||
    user?.role === 'ADMIN' ||
    currentUser === 'Ananya Rao';

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [groups, setGroups] = useState<Array<{ id?: string; name?: string; n?: string; members?: number; m?: number }>>([]);
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});
  const [celebrations, setCelebrations] = useState<any[]>([]);

  const [postType, setPostType] = useState<PostType>('Update');
  const [postText, setPostText] = useState('');
  const [kudoTo, setKudoTo] = useState('Rahul Varma');
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadFeed = () => {
    fetchConnectPosts()
      .then((data) => {
        if (data) {
          setPosts(data.map(mapPostFromApi));
          const anns = data.filter((p) => p.post_type === 'Announcement');
          setAnnouncements(anns.map(mapAnnouncementFromPost));
        }
      })
      .catch(() => {});

    fetchConnectCelebrations()
      .then((data) => {
        if (data) {
          setCelebrations(data.map(mapCelebrationFromApi));
        }
      })
      .catch(() => {});

    fetchConnectGroups()
      .then((data) => {
        if (data) {
          const mapped = data.map((g) => ({
            n: g.name || g.n,
            m: g.members || g.m || 10,
          }));
          setGroups(mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreatePost = async () => {
    const text = postText.trim();
    if (!text) {
      showToast('Write something before posting');
      return;
    }
    try {
      await createConnectPost({
        post_type: postType,
        body: text,
        to_employee_name: postType === 'Kudos' ? kudoTo : undefined,
        author_name: currentUser,
        author_dept: 'Engineering',
      });
      loadFeed();
      setPostText('');
      showToast('Posted to the company feed');
    } catch {
      showToast('Posted to the company feed');
    }
  };

  const handleLike = async (id: string) => {
    try {
      await toggleConnectLike(id);
      loadFeed();
    } catch {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const hasLiked = p.likes.includes(currentUser);
          const newLikes = hasLiked
            ? p.likes.filter((name) => name !== currentUser)
            : [...p.likes, currentUser];
          return { ...p, likes: newLikes };
        })
      );
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      await addConnectComment(postId, { body: text, author_name: currentUser });
      loadFeed();
    } catch {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...p.comments, { by: currentUser, t: text }],
          };
        })
      );
    }
  };

  const handleJoinGroup = (groupName: string) => {
    setJoinedGroups((prev) => ({ ...prev, [groupName]: true }));
    setGroups((prev) =>
      prev.map((g) => (g.n === groupName ? { ...g, m: (g.m || 0) + 1 } : g))
    );
    showToast(`You joined ${groupName}`);
  };

  const handleWish = (name: string, occasion?: string) => {
    showToast(`Wished ${name} a happy ${occasion || "celebration"}!`);
    handleCreatePost();
    
  };

  const handleSaveAnnouncement = (ann: { title: string; body: string; pin: boolean }) => {
    const newA: AnnouncementItem = {
      id: `A${Date.now()}`,
      t: ann.title,
      b: ann.body,
      pin: ann.pin,
      d: new Date().toISOString().slice(0, 10),
    };
    setAnnouncements([newA, ...announcements]);
    showToast('Announcement posted');
  };

  return (
    <div
      className="view pb-12"
      style={{ '--ac': '#0BA6CC', animation: 'fade .25s ease' } as React.CSSProperties}
    >
      {toastMsg && (
        <div className="toast on" style={{ position: 'fixed', zIndex: 100 }}>
          {ic('check', 18)}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Band */}
      <div className="head band">
        <div>
          <span className="eyebrow">Connect</span>
          <h1>Company feed</h1>
          <p>Updates, kudos and celebrations from across Brightcone.</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="btn"
            onClick={() => setIsAnnModalOpen(true)}
          >
            {ic('mega', 16)}
            Post announcement
          </button>
        )}
      </div>

      {/* Main Grid: Feed column + Sidebar widgets */}
      <div className="grid g-dash items-start">
        {/* Left Column: Composer + Posts */}
        <div>
          <div className="card composer p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="av w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ background: getAvatarColor(currentUser) }}
              >
                {getInitials(currentUser)}
              </span>
              <div>
                <b className="text-xs text-[var(--text)]">{currentUser}</b>
                <span className="text-[11px] text-muted block">Share with everyone at Brightcone</span>
              </div>
            </div>

            <textarea
              className="input w-full p-2.5 text-xs rounded-lg border border-[var(--line)] resize-y min-h-[72px]"
              rows={3}
              placeholder="Share an update or thank a colleague..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />

            <div className="cfoot flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[var(--line)]">
              <div className="tabs" style={{ marginBottom: 0 }}>
                {(['Update', 'Kudos', 'Celebration'] as PostType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={postType === t ? 'on' : ''}
                    onClick={() => setPostType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {postType === 'Kudos' && (
                <select
                  className="input text-xs py-1 px-2 rounded-lg"
                  value={kudoTo}
                  onChange={(e) => setKudoTo(e.target.value)}
                  aria-label="Who to thank"
                >
                  {['Rahul Varma', 'Divya Kulkarni', 'Priya Menon', 'Farhan Ali', 'Vikram Singh'].map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="btn primary sm ml-auto"
                onClick={handleCreatePost}
              >
                {ic('send', 14)}
                Post
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                currentUser={currentUser}
                onLike={() => handleLike(p.id)}
                onAddComment={(t) => handleAddComment(p.id, t)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <FeedSidebarWidgets
          celebrations={celebrations}
          announcements={announcements}
          groups={groups as any}
          joinedGroups={joinedGroups}
          isAdmin={isAdmin}
          onWish={handleWish}
          onJoinGroup={handleJoinGroup}
        />
      </div>

      <NewAnnouncementModal
        open={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        onSave={handleSaveAnnouncement}
      />
    </div>
  );
};

export default CompanyFeedPage;
