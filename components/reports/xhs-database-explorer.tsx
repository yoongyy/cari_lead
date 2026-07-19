"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, FileText, MapPin, ThumbsUp, Link as LinkIcon, Calendar, Activity } from "lucide-react";

interface XhsPost {
  _id: string;
  title: string;
  body: string;
  author_name: string;
  location_label: string;
  likes: number;
  comment_count: number;
  url: string;
  crawled_at: string;
  malaysia_signals: string[];
}

interface XhsComment {
  _id: string;
  post_id: string;
  text: string;
  author_name: string;
  location_label: string;
  likes: number;
  crawled_at: string;
}

export function XhsDatabaseExplorer() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<XhsPost[]>([]);
  const [comments, setComments] = useState<XhsComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/xhs-data?limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPosts(data.posts);
          setComments(data.comments);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load XHS capture stream:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Widget Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" />
              XHS Captured Database Explorer
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
              Showing raw records processed by crawl engine
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "posts"
                ? "bg-white text-navy shadow-sm"
                : "text-slate-500 hover:text-navy"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "comments"
                ? "bg-white text-navy shadow-sm"
                : "text-slate-500 hover:text-navy"
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            Comments ({comments.length})
          </button>
        </div>
      </div>

      {/* Widget Body Content */}
      <div className="p-6 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <span className="animate-spin text-primary text-xl mb-3">📡</span>
            <p className="text-xs font-semibold">Connecting to MongoDB capture stream...</p>
          </div>
        ) : activeTab === "posts" ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="border-b border-slate-100 last:border-0 pb-6 last:pb-0 group"
              >
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-navy font-bold">@{post.author_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {post.location_label || "Malaysia"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    crawled {new Date(post.crawled_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-navy group-hover:text-primary transition-colors flex items-center justify-between gap-4">
                  {post.title}
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-primary transition-colors"
                      title="View original post on XHS"
                    >
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  )}
                </h4>

                {/* Body Text */}
                <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                  {post.body}
                </p>

                {/* Signal indicators & actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.malaysia_signals?.map((sig) => (
                      <span
                        key={sig}
                        className="px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary-dark uppercase"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="w-3 h-3" /> {post.likes || 0} likes
                    </span>
                    <span>•</span>
                    <span>{post.comment_count || 0} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comm) => {
              // Find matching post title for context
              const parentPost = posts.find((p) => p._id === comm.post_id);
              return (
                <div
                  key={comm._id}
                  className="border-b border-slate-100 last:border-0 pb-6 last:pb-0"
                >
                  {/* Meta details */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[10px] text-slate-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-navy font-bold">@{comm.author_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {comm.location_label || "Malaysia"}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      crawled {new Date(comm.crawled_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-navy leading-relaxed font-semibold italic bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3">
                    &ldquo;{comm.text}&rdquo;
                  </p>

                  {/* Context banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] text-slate-400 font-semibold truncate max-w-sm">
                      Context: <span className="text-slate-600 font-bold">{parentPost?.title || "XHS Insurance Discussion"}</span>
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                      <ThumbsUp className="w-3 h-3 text-slate-400" />
                      <span>{comm.likes || 0} likes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
