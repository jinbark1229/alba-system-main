// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const DEMO_ACCOUNTS = [
    { name: "admin", password: "admin", role: "admin", storeId: "both", label: "관리자 (Admin)" },
    { name: "boss", password: "boss", role: "boss", storeId: "both", label: "사장님 (Boss)" },
    { name: "yeonsan", password: "yeonsan", role: "worker", storeId: "store1", label: "연산점 알바생" },
    { name: "bujeon", password: "bujeon", role: "worker", storeId: "store2", label: "부전점 알바생" },
    { name: "dual", password: "dual", role: "worker", storeId: "both", label: "양쪽 지점 알바생" }
] as const;

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1) 데모 계정 먼저 확인 (Supabase 불필요, 항상 로그인 가능)
            const demoMatch = DEMO_ACCOUNTS.find(
                a => a.name === identifier && a.password === password
            );
            if (demoMatch) {
                login({
                    id: `demo-${demoMatch.name}`,
                    name: demoMatch.name,
                    password: demoMatch.password,
                    role: demoMatch.role as "worker" | "boss" | "admin",
                    storeId: demoMatch.storeId as "store1" | "store2" | "both",
                    token: `token-demo-${demoMatch.name}`
                });
                navigate("/");
                return;
            }

            // 2) 일반 사용자 — Supabase에서 직접 조회 (항상 최신 데이터)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('name', identifier)
                .single();

            if (error || !data) {
                alert("사용자를 찾을 수 없습니다.");
                return;
            }

            // 삭제 또는 허용 이름에 없으면 차단 (Supabase에서 직접 확인 — 항상 최신)
            const isBossOrAdmin = data.role === "boss" || data.role === "admin";
            if (!isBossOrAdmin) {
                const { data: allowed } = await supabase
                    .from('allowed_names')
                    .select('name')
                    .eq('name', data.name)
                    .single();
                if (!allowed) {
                    alert("더 이상 로그인 권한이 없습니다.\n사장님에게 문의하세요.");
                    return;
                }
            }


            // 비밀번호 검증
            if (data.password && data.password !== password) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
            }

            login({
                id: data.id,
                name: data.name,
                password: data.password,
                role: data.role,
                storeId: data.store_id || undefined,
                token: `token-${data.id}`
            });
            navigate("/");

        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="absolute top-6 left-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    뒤로
                </button>
                <Link
                    to="/"
                    className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">home</span>
                    홈
                </Link>
            </div>

            <div className="bg-white dark:bg-[#1e2936] w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">로그인</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        알바시스템에 오신 것을 환영합니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            이름 (또는 이메일)
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="홍길동"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-blue-600 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all text-lg"
                    >
                        {isSubmitting ? "확인 중..." : "로그인"}
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-medium text-slate-400">또는</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                <div className="text-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">계정이 없으신가요? </span>
                    <Link
                        to="/register"
                        className="text-primary font-bold hover:underline ml-1 text-sm"
                    >
                        회원가입
                    </Link>
                </div>

                {/* 포트폴리오 안내 칸 */}
                <div className="mt-8 p-5 bg-slate-50 dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-xl">info</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            포트폴리오 평가용 테스트 계정
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {DEMO_ACCOUNTS.map((account) => (
                            <div key={account.name}
                                className="flex justify-between items-center p-3 bg-white dark:bg-[#1e2936] rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => { setIdentifier(account.name); setPassword(account.password); }}
                            >
                                <div>
                                    <div className="text-xs font-bold text-primary mb-1">{account.label}</div>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        아이디: {account.name} <span className="mx-1 text-slate-300">|</span> 비밀번호: {account.password}
                                    </div>
                                </div>
                                <button className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    선택
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
