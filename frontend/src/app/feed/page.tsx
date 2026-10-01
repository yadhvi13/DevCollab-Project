"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Navbar from '@/components/Navbar';
import { MessageSquare, Heart, Send, Award, Zap, Code, Sparkles, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/ui/EmptyState';

function SocialFeed() {
  const { user, token } = useAuth();
  const { onlineUsers } = useSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('update');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newPost, type: postType })
      });
      if (res.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        setCommentText('');
        fetchPosts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPostBadge = (type: string) => {
    switch(type) {
      case 'achievement':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[#B45309] dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 inline-flex items-center gap-1">
            <Award className="w-3 h-3 text-[#FFB800]" /> Milestone
          </span>
        );
      case 'release':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 inline-flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-500" /> Release
          </span>
        );
      case 'blog':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-[#B7194B]/10 text-[#B7194B] dark:text-rose-400 border border-rose-200/60 dark:border-[#B7194B]/20 inline-flex items-center gap-1">
            <Code className="w-3 h-3 text-[#B7194B]" /> Note
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200/50 dark:border-zinc-700 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Update
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2EF] dark:bg-[#090909] text-[#1C1917] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar />
      
      <main className="max-w-2xl w-full mx-auto px-4 py-8 md:py-12 flex-1">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-[#B7194B]/15 text-[#B7194B] dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-[#B7194B]/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Stream</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1C1917] dark:text-white tracking-tight">
            Developer <span className="text-[#B7194B]">Feed</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
            Real-time updates, milestone achievements, and releases from the DevCollab community.
          </p>
        </div>

        {/* Create Post Card */}
        <div className="glass-card p-5 md:p-6 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-[#E2E0DB] dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] rounded-3xl mb-8">
          <form onSubmit={handlePostSubmit}>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#B7194B] flex items-center justify-center font-bold text-sm text-white shrink-0 border border-white/20 shadow-xs">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <textarea 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What are you building or launching today?"
                  className="w-full text-xs sm:text-sm p-3.5 bg-gray-50/80 dark:bg-[#18191E] border border-gray-200/70 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-[#B7194B] focus:bg-white dark:focus:bg-[#121316] focus:ring-2 focus:ring-[#B7194B]/15 transition-all text-[#1C1917] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 min-h-[90px] resize-none"
                />
                
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <select 
                    value={postType} 
                    onChange={(e) => setPostType(e.target.value)}
                    className="text-xs py-2 px-3.5 bg-gray-50 dark:bg-[#18191E] border border-gray-200 dark:border-zinc-800 rounded-full cursor-pointer font-bold text-[#1C1917] dark:text-zinc-200 focus:outline-none focus:border-[#B7194B]"
                  >
                    <option value="update">Status Update</option>
                    <option value="achievement">Milestone / Achievement</option>
                    <option value="release">Release / Launch</option>
                    <option value="blog">Technical Note</option>
                  </select>
                  
                  <button 
                    type="submit"
                    disabled={!newPost.trim()}
                    className="btn-pill-red px-6 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-[0_6px_16px_rgba(183,25,75,0.3)]"
                  >
                    <span>Share Update</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Posts Stream */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card p-6 h-40 animate-pulse bg-white/60 dark:bg-zinc-800/60 rounded-3xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="w-8 h-8 text-[#B7194B]" />}
              title="No posts yet"
              description="No updates have been shared yet. Be the first developer to share what you are building!"
            />
          ) : (
            posts.map((post) => {
              const hasLiked = post.likes?.includes(user?.id) || post.likes?.includes(user?._id);
              const isAuthorOnline = onlineUsers?.includes(post.user?._id) || onlineUsers?.includes(post.user?.id);

              return (
                <div key={post._id} className="glass-card p-5 md:p-6 bg-white/85 dark:bg-[#121316]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] rounded-3xl">
                  {/* Author Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B7194B] to-[#e6326c] text-white flex items-center justify-center text-sm font-bold overflow-hidden border border-white/20 shadow-xs">
                          {post.user?.avatar ? (
                            <img src={post.user.avatar} alt={post.user.username} className="w-full h-full object-cover" />
                          ) : (
                            post.user?.username?.charAt(0).toUpperCase()
                          )}
                        </div>
                        {isAuthorOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white dark:border-zinc-900 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-extrabold text-base text-[#1C1917] dark:text-white">{post.user?.username}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
                            Lvl {post.user?.level || 1}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                          {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>

                    {getPostBadge(post.type)}
                  </div>
                  
                  {/* Content */}
                  <p className="font-sans text-xs sm:text-sm text-[#1C1917] dark:text-zinc-200 whitespace-pre-wrap mb-5 leading-relaxed font-normal">
                    {post.content}
                  </p>
                  
                  {/* Interactions: Like & Comments */}
                  <div className="flex items-center gap-6 border-t border-gray-100 dark:border-zinc-800 pt-4 text-xs font-bold">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        hasLiked ? 'text-[#B7194B]' : 'text-zinc-500 dark:text-zinc-400 hover:text-[#B7194B] dark:hover:text-[#B7194B]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#B7194B]' : ''}`} />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>

                    <button 
                      onClick={() => setExpandedPostId(expandedPostId === post._id ? null : post._id)}
                      className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-[#1C1917] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  {/* Comments Thread */}
                  {expandedPostId === post._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment: any, cIdx: number) => (
                          <div key={cIdx} className="p-3 rounded-2xl bg-gray-50 dark:bg-[#18191E] border border-gray-200/60 dark:border-zinc-800/80 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#1C1917] dark:text-zinc-200">{comment.user?.username || 'Dev'}</span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-400 italic">No replies yet. Start the thread!</p>
                      )}

                      {/* Comment Input */}
                      <form onSubmit={(e) => handleCommentSubmit(post._id, e)} className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 text-xs py-2 px-3.5 bg-gray-50 dark:bg-[#18191E] border border-gray-200/80 dark:border-zinc-800 rounded-full focus:outline-none focus:border-[#B7194B] text-[#1C1917] dark:text-zinc-100 placeholder:text-zinc-400"
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="btn-pill-red px-4 py-1.5 text-xs font-bold disabled:opacity-40"
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <SocialFeed />
    </ProtectedRoute>
  );
}
