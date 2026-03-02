// src/utils/seedDemoData.ts
// This runs once on first visit to pre-populate localStorage with demo data.

const SEED_VERSION = "v1.2"; // bump this to force re-seed

export function seedDemoDataIfNeeded() {
    const seeded = localStorage.getItem("alba_seeded");
    if (seeded === SEED_VERSION) return;

    // ── Notices ──────────────────────────────────────────────
    const notices = [
        {
            id: "notice-001",
            title: "3월 근무 규정 안내",
            content: "안녕하세요! 3월부터 변경되는 근무 규정을 아래와 같이 안내드립니다.\n\n1. 출근 시간: 5분 전까지 도착\n2. 복장: 회사 유니폼 착용 필수\n3. 휴게시간: 4시간 이상 근무 시 30분 보장\n\n문의사항은 사장님에게 연락 주세요.",
            author: "boss",
            storeId: "all",
            priority: "important",
            imageUrls: [],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: "notice-002",
            title: "[연산점] 이번 주 청소 담당 변경",
            content: "이번 주 수요일 청소 담당이 변경되었습니다.\n\n수요일: 김철수 → 이영희\n\n담당 변경 내용 꼭 확인하시고 준비해 주세요!",
            author: "boss",
            storeId: "store1",
            priority: "normal",
            imageUrls: [],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: "notice-003",
            title: "[부전점] 냉장고 정리 요청",
            content: "부전점 냉장고 정리가 필요합니다.\n유통기한 지난 물품 확인 후 폐기 처리 부탁드립니다.\n정리 후 사진으로 보고해 주세요.",
            author: "boss",
            storeId: "store2",
            priority: "normal",
            imageUrls: [],
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: "notice-004",
            title: "🚨 긴급 공지 - 카드 단말기 점검",
            content: "내일 오전 10시~12시 카드 단말기 정기 점검이 예정되어 있습니다.\n해당 시간 동안 현금 결제만 가능하오니 고객 안내 부탁드립니다.",
            author: "boss",
            storeId: "all",
            priority: "urgent",
            imageUrls: [],
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
    ];

    // ── Schedules (current month) ──────────────────────────────
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const workerNames = [
        { name: "김철수", store: "store1" },
        { name: "이영희", store: "store1" },
        { name: "박민준", store: "store2" },
        { name: "최수진", store: "store2" },
        { name: "정다은", store: "both" },
    ];

    const shifts = [
        { start: "09:00", end: "15:00" },
        { start: "13:00", end: "19:00" },
        { start: "17:00", end: "22:00" },
    ];

    const schedules: object[] = [];
    let idCounter = 1;
    for (let day = 1; day <= 28; day++) {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayOfWeek = new Date(year, month, day).getDay();
        if (dayOfWeek === 0) continue; // skip Sundays

        workerNames.forEach((worker) => {
            if (Math.random() < 0.45) return; // ~45% chance of no shift
            const shift = shifts[Math.floor(Math.random() * shifts.length)];
            if (worker.store === "both") {
                // appears in both stores
                ["store1", "store2"].forEach((store) => {
                    schedules.push({
                        id: `sched-${idCounter++}`,
                        name: worker.name,
                        date,
                        start: shift.start,
                        end: shift.end,
                        storeId: store,
                    });
                });
            } else {
                schedules.push({
                    id: `sched-${idCounter++}`,
                    name: worker.name,
                    date,
                    start: shift.start,
                    end: shift.end,
                    storeId: worker.store,
                });
            }
        });
    }

    localStorage.setItem("alba_notices", JSON.stringify(notices));
    localStorage.setItem("alba_schedules", JSON.stringify(schedules));
    localStorage.setItem("alba_seeded", SEED_VERSION);
}
