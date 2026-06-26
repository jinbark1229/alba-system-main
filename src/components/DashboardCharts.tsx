// src/components/DashboardCharts.tsx
import { useState, useEffect, useMemo } from "react";
import { getAllLogs, getAllWages, type WorkLog } from "../services/api";
import { calculateDuration } from "../utils/timeUtils";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from "../lib/supabase";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6', '#F43F5E', '#10B981'];

export default function DashboardCharts() {
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [wages, setWages] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allLogs, allWages] = await Promise.all([
                    getAllLogs(),
                    getAllWages()
                ]);
                setLogs(allLogs);
                setWages(allWages);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const channel = supabase.channel('work_logs_changes_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'work_logs' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Filter logs by selected month
    const monthlyLogs = useMemo(() => {
        return logs.filter(log => log.date.startsWith(selectedMonth));
    }, [logs, selectedMonth]);

    // Data processing for charts
    const chartData = useMemo(() => {
        const userStats: Record<string, { hours: number, pay: number }> = {};

        monthlyLogs.forEach(log => {
            const duration = calculateDuration(log.start, log.end, log.break ? (log.breakDuration || 60) : 0);
            if (!userStats[log.userName]) {
                userStats[log.userName] = { hours: 0, pay: 0 };
            }
            userStats[log.userName].hours += duration;
            
            // Simple pay estimation for chart (ignoring night/holiday for dashboard simplicity)
            const hourlyWage = wages[log.userName] || 9860;
            userStats[log.userName].pay += duration * hourlyWage;
        });

        const dataArray = Object.entries(userStats).map(([name, stats]) => ({
            name,
            hours: Number(stats.hours.toFixed(1)),
            pay: Math.floor(stats.pay)
        })).sort((a, b) => b.hours - a.hours);

        return dataArray;
    }, [monthlyLogs, wages]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중...</div>;
    }

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500">analytics</span>
                        인건비 & 근무 통계
                    </h2>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a2632] text-sm text-slate-900 dark:text-white"
                    />
                </div>
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    해당 월의 근무 기록이 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">analytics</span>
                    인건비 & 근무 통계
                </h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1a2632] text-sm text-slate-900 dark:text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart: Expected Salary by Worker */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">알바생별 예상 인건비 (단순 계산)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `${val / 10000}만`} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '예상 급여']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="pay" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Work Hours Ratio */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">근무 시간 비중</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="hours"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => [`${value}시간`, '근무 시간']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
