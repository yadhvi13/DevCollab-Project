import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { MessageSquare, Heart, Share2, Award, Zap, Code, Send } from 'lucide-react';

export default function SocialFeedPage() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('update');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
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
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
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

  const getPostIcon = (type: string) => {
    switch(type) {
      case 'achievement': return <Award className="w-5 h-5 text-yellow-400" />;
      case 'release': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'blog': return <Code className="w-5 h-5 text-indigo-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Create Post */}
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
           <form onSubmit={handlePostSubmit} className="relative z-10">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                    {user?.username?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 space-y-3">
                    <textarea 
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share an update, achievement, or release..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                       <select 
                         value={postType} 
                         onChange={(e) => setPostType(e.target.value)}
                         className="bg-[#21262d] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg outline-none"
                       >
                         <option value="update">Status Update</option>
                         <option value="achievement">Achievement</option>
                         <option value="release">Release / Launch</option>
                         <option value="blog">Blog Post</option>
                       </select>
                       
                       <button 
                         type="submit"
                         disabled={!newPost.trim()}
                         className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                       >
                          Post <Send className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           </form>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
             <div key={post._id} className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {post.user.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-white">{post.user.username}</h3>
                         <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Level {post.user.level || 1}</span>
                       </div>
                       <p className="text-xs text-[#8b949e]">
                         {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </p>
                     </div>
                   </div>
                   {getPostIcon(post.type)}
                </div>
                
                <div className="text-sm text-[#c9d1d9] whitespace-pre-wrap mb-6 leading-relaxed">
                   {post.content}
                </div>
                
                <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                   <button 
                     onClick={() => handleLike(post._id)}
                     className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${post.likes.includes(user?.id) ? 'text-pink-500' : 'text-[#8b949e] hover:text-white'}`}
                   >
                     <Heart className={`w-4 h-4 ${post.likes.includes(user?.id) ? 'fill-current' : ''}`} /> {post.likes.length} Likes
                   </button>
                   <button className="flex items-center gap-1.5 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors">
                     <MessageSquare className="w-4 h-4" /> {post.comments?.length || 0} Comments
                   </button>
                   <button className="flex items-center gap-1.5 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors ml-auto">
                     <Share2 className="w-4 h-4" /> Share
                   </button>
                </div>
             </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12 text-[#8b949e]">
              No posts yet. Be the first to share an update!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
