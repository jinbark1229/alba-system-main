// src/components/ShiftSwapBoard.tsx
import { useState, useEffect } from "react";
import { getSchedules, type Schedule, getShiftSwaps, type ShiftSwap, requestShiftSwap, acceptShiftSwap, approveShiftSwap, rejectShiftSwap, cancelShiftSwap } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function ShiftSwapBoard() {
    const { user } = useAuth();
    const isBossOrAdmin = user?.role === 'boss' || user?.role === 'admin';
    const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState("");

    useEffect(() => {
        fetchData();

        const channel = supabase.channel('shift_swaps_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_swaps' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        try {
            const [swapsData, schedulesData] = await Promise.all([
                getShiftSwaps(),
                getSchedules()
            ]);
            setSwaps(swapsData);
            setSchedules(schedulesData);
        } catch (error) {
            console.error("Failed to fetch swap data:", error);
        }
    };

    const handleRequestSwap = async () => {
        if (!selectedScheduleId || !user) return;
        try {
            await requestShiftSwap(selectedScheduleId, user.name);
            setSelectedScheduleId("");
        } catch (error) {
            alert("대타 요청 중 오류가 발생했습니다.");
        }
    };

    const handleAccept = async (swapId: string) => {
        if (!user || !window.confirm("정말 이 대타를 수락하시겠습니까?")) return;
        try {
            await acceptShiftSwap(swapId, user.name);
        } catch (error) {
            alert("수락 중 오류가 발생했습니다.");
        }
    };

    const handleApprove = async (swap: ShiftSwap) => {
        if (!window.confirm("이 근무 교환을 승인하시겠습니까?")) return;
        try {
            await approveShiftSwap(swap.id, swap.scheduleId, swap.acceptorName!);
        } catch (error) {
            alert("승인 중 오류가 발생했습니다.");
        }
    };

    const handleReject = async (swapId: string) => {
        if (!window.confirm("이 근무 교환을 거절하시겠습니까?")) return;
        try {
            await rejectShiftSwap(swapId);
        } catch (error) {
            alert("거절 중 오류가 발생했습니다.");
        }
    };

    const handleCancel = async (swapId: string) => {
        if (!window.confirm("이 대타 요청을 취소하시겠습니까?")) return;
        try {
            await cancelShiftSwap(swapId);
        } catch (error) {
            alert("요청 취소 중 오류가 발생했습니다.");
        }
    };

    // Derived data
    const myFutureSchedules = schedules.filter(s => s.name === user?.name && new Date(s.date) >= new Date());
    const availableSwaps = swaps.filter(s => s.status === 'pending' && s.requesterName !== user?.name);
    const myPendingSwaps = swaps.filter(s => s.requesterName === user?.name && s.status === 'pending');
    const waitingForApproval = swaps.filter(s => s.status === 'accepted');

    const getScheduleText = (id: string) => {
        const s = schedules.find(x => x.id === id);
        if (!s) return "알 수 없는 스케줄";
        return `${s.date} (${s.start}~${s.end})`;
    };

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">swap_horiz</span>
                근무 스왑 (대타) 게시판
            </h2>

            {/* Worker: Request Swap Form */}
            {user?.role === 'worker' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">내 대타 요청하기</p>
                    <div className="flex gap-2">
                        <select
                            value={selectedScheduleId}
                            onChange={e => setSelectedScheduleId(e.target.value)}
                            className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a2632] text-sm text-slate-900 dark:text-white"
                        >
                            <option value="">교환할 근무 선택...</option>
                            {myFutureSchedules.map(s => (
                                <option key={s.id} value={s.id}>
                                    {getScheduleText(s.id)}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleRequestSwap}
                            disabled={!selectedScheduleId}
                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            요청
                        </button>
                    </div>
                </div>
            )}

            {/* Admin/Boss: Pending Approvals */}
            {isBossOrAdmin && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-amber-500">gavel</span>
                        승인 대기 (수락된 대타)
                    </h3>
                    <div className="flex flex-col gap-2">
                        {waitingForApproval.length === 0 ? (
                            <p className="text-xs text-slate-500">승인 대기 중인 요청이 없습니다.</p>
                        ) : (
                            waitingForApproval.map(swap => (
                                <div key={swap.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{getScheduleText(swap.scheduleId)}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                                            <span className="text-red-500 line-through mr-1">{swap.requesterName}</span> 
                                            → <span className="text-emerald-500 font-bold ml-1">{swap.acceptorName}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleApprove(swap)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded font-medium">승인</button>
                                        <button onClick={() => handleReject(swap.id)} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-xs rounded font-medium">거절</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Workers: Available Swaps */}
            {user?.role === 'worker' && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-emerald-500">event_available</span>
                        대타 가능 목록
                    </h3>
                    <div className="flex flex-col gap-2">
                        {availableSwaps.length === 0 ? (
                            <p className="text-xs text-slate-500">구하고 있는 대타가 없습니다.</p>
                        ) : (
                            availableSwaps.map(swap => (
                                <div key={swap.id} className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{getScheduleText(swap.scheduleId)}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">요청자: <span className="font-bold">{swap.requesterName}</span></p>
                                    </div>
                                    <button onClick={() => handleAccept(swap.id)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded font-medium shrink-0">
                                        수락하기
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* My Pending Swaps */}
            {user?.role === 'worker' && myPendingSwaps.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-blue-500">schedule</span>
                        내 요청 진행상황
                    </h3>
                    <div className="flex flex-col gap-2">
                        {myPendingSwaps.map(swap => (
                            <div key={swap.id} className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-4">
                                <div className="text-sm">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{getScheduleText(swap.scheduleId)}</p>
                                </div>
                                <span className="text-xs font-medium text-slate-500">대기중</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Workers: My Pending Swaps */}
            {user?.role === 'worker' && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-blue-500">pending_actions</span>
                        내가 요청한 대타 (대기 중)
                    </h3>
                    <div className="flex flex-col gap-2">
                        {myPendingSwaps.length === 0 ? (
                            <p className="text-xs text-slate-500">요청한 대타가 없습니다.</p>
                        ) : (
                            myPendingSwaps.map(swap => (
                                <div key={swap.id} className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-lg flex items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{getScheduleText(swap.scheduleId)}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">수락 대기 중...</p>
                                    </div>
                                    <button onClick={() => handleCancel(swap.id)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-medium shrink-0">
                                        요청 취소
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
