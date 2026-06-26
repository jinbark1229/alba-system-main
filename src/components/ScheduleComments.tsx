// src/components/ScheduleComments.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getComments, addComment, deleteComment, type ScheduleComment } from '../services/api';
import { supabase } from '../lib/supabase';

export default function ScheduleComments() {
    const { user } = useAuth();
    const [currentStore, setCurrentStore] = useState<'store1' | 'store2'>(
        user?.storeId === 'store2' ? 'store2' : 'store1'
    );
    const isBossOrAdmin = user?.role === 'boss' || user?.role === 'admin';
    const canToggleStore = isBossOrAdmin || user?.storeId === 'both';

    const [comments, setComments] = useState<ScheduleComment[]>([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        fetchComments();

        const channel = supabase.channel('comments_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchComments = async () => {
        try {
            const data = await getComments();
            setComments(data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            await addComment(user.name, newComment, currentStore);
            setNewComment("");
        } catch (error) {
            alert("댓글 등록 실패");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await deleteComment(id);
        } catch (error) {
            alert("삭제 실패");
        }
    };

    const displayedComments = comments.filter(c =>
        (c.storeId === currentStore) || (!c.storeId && currentStore === 'store1')
    );

    return (
        <div className="flex flex-col h-full">
            {canToggleStore && (
                <div className="flex justify-end mb-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
                        <button
                            onClick={() => setCurrentStore('store1')}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${currentStore === 'store1' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            연산점
                        </button>
                        <button
                            onClick={() => setCurrentStore('store2')}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${currentStore === 'store2' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            부전점
                        </button>
                    </div>
                </div>
            )}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">chat</span>
                    {currentStore === 'store1' ? '연산점' : '부전점'} 대타/변경 요청
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    근무 변경이나 대타가 필요하면 자유롭게 남겨주세요.
                </p>
            </div>

            {user?.role !== 'boss' && (
                <form onSubmit={handleAddComment} className="mb-6 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`${currentStore === 'store1' ? '연산점' : '부전점'} 대타 구합니다...`}
                        rows={3}
                        required
                        className="w-full px-4 py-3 pb-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none shadow-inner"
                    />
                    <button
                        type="submit"
                        className="absolute bottom-3 right-3 bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-lg text-sm shadow-sm hover:shadow transition-all"
                    >
                        등록
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 max-h-[500px]">
                {displayedComments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 dark:border-slate-700/50 rounded-xl">
                        작성된 글이 없습니다.
                    </div>
                ) : (
                    displayedComments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {comment.author.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.author}</span>
                                    <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                {(user?.name === comment.author || user?.role === 'boss') && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        title="삭제"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed pl-8">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
