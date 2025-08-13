// 상태 라벨
export const BASE_LABEL = {
    PENDING:   '접수 대기',
    ACCEPTED:  '접수 완료',
    EXPIRED:   '만료됨',
    REJECTED:  '거절됨',
    CANCELLED: '취소됨',
};

// 역할별 색상 팔레트
export const ROLE_COLOR = {
    ADMIN: {
        PENDING: { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
        ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
        EXPIRED:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
        REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
        CANCELLED:   { fg: '#92400e', bg: '#fef3c7', bd: '#fcd34d' },
    },
    STAFF: {
        PENDING: { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
        ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
        EXPIRED:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
        REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
        CANCELLED:   { fg: '#92400e', bg: '#fef3c7', bd: '#fcd34d' },

    },
    ENGINEER: {
        PENDING:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
        ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
        EXPIRED:   { fg: '#374151', bg: '#f3f4f6', bd: '#e5e7eb' },
        REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
        CANCELLED: { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
    },
};

export function getStatusMeta(role, status) {
    const color = ROLE_COLOR[role]?.[status] || ROLE_COLOR.ADMIN[status];
    const label = BASE_LABEL[status] || status;
    return { color, label };
}
