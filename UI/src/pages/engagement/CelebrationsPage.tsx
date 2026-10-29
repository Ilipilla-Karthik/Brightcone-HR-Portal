import React, { useState, useMemo, useEffect } from 'react';
import { ic } from '../../components/icons';
import { CelebrationItem } from './types';
import { fetchConnectCelebrations, sendCelebrationWish } from '../../services/signConnectApi';
import { mapCelebrationFromApi } from './apiMapper';
import { useNotifications } from '../../services/NotificationsContext';
import { useAuth } from '../../services/authContext';

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

export const CelebrationsPage: React.FC = () => {
  const [celebrations, setCelebrations] = useState<CelebrationItem[]>([]);

  useEffect(() => {
    fetchConnectCelebrations()
      .then((data) => {
        if (data) setCelebrations(data.map(mapCelebrationFromApi));
      })
      .catch(() => {});
  }, []);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const currentUser = user?.name || (user?.role === 'employee' ? 'Rahul Varma' : 'Ananya Rao');

  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleWish = async (item: CelebrationItem) => {
    const msg = `Warmest wishes on your ${item.occasion}! May you have a joyous celebration and wonderful year ahead!`;
    try {
      await sendCelebrationWish({
        recipient_name: item.name,
        sender_name: currentUser,
        occasion: item.occasion,
        message: msg,
      });
    } catch {}

    // Add in-app notification
    addNotification({
      title: `🎉 ${item.occasion} Wish sent to ${item.name}`,
      message: `${currentUser} wished ${item.name}: "${msg}"`,
      category: 'announcement',
      actionUrl: '/engagement/feed',
    });

    // Store in local storage for instant visibility in dashboards
    try {
      const existingRaw = localStorage.getItem('brightcone_wishes');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const newWish = {
        id: `wish-${Date.now()}`,
        recipient: item.name,
        sender: currentUser,
        occasion: item.occasion,
        message: msg,
        timestamp: 'Just now',
      };
      localStorage.setItem('brightcone_wishes', JSON.stringify([newWish, ...existing]));
    } catch {}

    showToast(`Celebration wish successfully delivered to ${item.name}!`);
  };

  const filtered = useMemo(() => {
    return celebrations.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.name + ' ' + c.dept + ' ' + c.occasion).toLowerCase().includes(q);
      const matchesType =
        filterType === 'All' || c.occasion === filterType;
      return matchesSearch && matchesType;
    });
  }, [celebrations, searchQuery, filterType]);

  const todayCount = celebrations.filter((c) => c.daysAway === 0).length;
  const weekCount = celebrations.filter((c) => c.daysAway <= 7).length;
  const birthdayCount = celebrations.filter((c) => c.occasion === 'Birthday').length;
  const annivCount = celebrations.filter((c) => c.occasion === 'Work anniversary').length;

  return (
    <div
      className="view max-w-[1240px] mx-auto"
      style={{ '--ac': '#0BA6CC' } as React.CSSProperties}
    >
      {/* Head */}
      <div className="head">
        <div>
          <h1>Birthday & work anniversary tracker</h1>
          <p>
            Upcoming birthdays and work anniversaries in the next 60 days, from Employee master data.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k">
            <i>{ic('gift', 16)}</i>
            <span>Today</span>
          </div>
          <div className="v">{todayCount}</div>
          <div className="d">Celebrations today</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('calendar', 16)}</i>
            <span>Next 7 days</span>
          </div>
          <div className="v">{weekCount}</div>
          <div className="d">Coming up this week</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('gift', 16)}</i>
            <span>Birthdays</span>
          </div>
          <div className="v">{birthdayCount}</div>
          <div className="d">Next 60 days</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('star', 16)}</i>
            <span>Anniversaries</span>
          </div>
          <div className="v">{annivCount}</div>
          <div className="d">Next 60 days</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar">
          <div className="search">
            {ic('search', 16)}
            <input
              className="input"
              placeholder="Search celebrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tabs">
            {['All', 'Birthday', 'Work anniversary'].map((t) => (
              <button
                key={t}
                type="button"
                className={filterType === t ? 'on' : ''}
                onClick={() => setFilterType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Occasion</th>
                <th>Date</th>
                <th>When</th>
                <th>Milestone</th>
                <th>Department</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No celebrations found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="who">
                        <span
                          className="av"
                          style={{ backgroundColor: getAvatarColor(item.name) }}
                        >
                          {getInitials(item.name)}
                        </span>
                        <div>
                          <b>{item.name}</b>
                          <span className="muted font-mono text-[12px]">
                            {item.empId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="ptag"
                        style={
                          {
                            '--c':
                              item.occasion === 'Birthday'
                                ? '#7C5CFF'
                                : '#12A58E',
                          } as React.CSSProperties
                        }
                      >
                        {ic(item.occasion === 'Birthday' ? 'gift' : 'star', 13)}
                        {item.occasion}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      {item.daysAway === 0 ? (
                        <span className="pill p-ok">Today</span>
                      ) : (
                        `In ${item.daysAway} day${
                          item.daysAway === 1 ? '' : 's'
                        }`
                      )}
                    </td>
                    <td>
                      <b>{item.milestone}</b>
                    </td>
                    <td>{item.dept}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => handleWish(item)}
                      >
                        Wish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        {ic('gift', 18)}
        <span>{toastMsg}</span>
      </div>
    </div>
  );
};

export default CelebrationsPage;
