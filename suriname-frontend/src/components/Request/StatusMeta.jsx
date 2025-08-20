export const BASE_LABEL = {
  PENDING:   '접수 대기',
  ACCEPTED:  '접수 완료',
  EXPIRED:   '만료됨',
  REJECTED:  '거절됨',
  CANCELLED: '취소됨',
};

export const ROLE_COLOR = {
  ADMIN: {
    PENDING:   { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
    ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
    EXPIRED:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
    REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
    CANCELLED: { fg: '#92400e', bg: '#fef3c7', bd: '#fcd34d' },
  },
  STAFF: {
    PENDING:   { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
    ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
    EXPIRED:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
    REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
    CANCELLED: { fg: '#92400e', bg: '#fef3c7', bd: '#fcd34d' },
  },
  ENGINEER: {
    PENDING:   { fg: '#9a3412', bg: '#ffedd5', bd: '#fdba74' },
    ACCEPTED:  { fg: '#065f46', bg: '#d1fae5', bd: '#34d399' },
    EXPIRED:   { fg: '#374151', bg: '#f3f4f6', bd: '#e5e7eb' },
    REJECTED:  { fg: '#991b1b', bg: '#fee2e2', bd: '#fca5a5' },
    CANCELLED: { fg: '#3f3f46', bg: '#fafafa', bd: '#e4e4e7' },
  },
};

export const REQUEST_LABEL = {
  RECEIVED:            '접수',
  REPAIRING:           '수리중',
  WAITING_FOR_PAYMENT: '입금대기',
  WAITING_FOR_DELIVERY:'배송대기',
  COMPLETED:           '완료',
};

export const REQUEST_COLOR = {
  RECEIVED:            { fg: '#1f2937', bg: '#f3f4f6', bd: '#d1d5db' },
  REPAIRING:           { fg: '#1e3a8a', bg: '#dbeafe', bd: '#93c5fd' },
  WAITING_FOR_PAYMENT: { fg: '#1d4ed8', bg: '#dbeafe', bd: '#60a5fa' },
  WAITING_FOR_DELIVERY:{ fg: '#1d4ed8', bg: '#e0f2fe', bd: '#7dd3fc' },
  COMPLETED:           { fg: '#065f46', bg: '#ecfdf5', bd: '#34d399' },
};

const REQUEST_STATES = new Set(Object.keys(REQUEST_LABEL));
const ASSIGNMENT_STATES = new Set(Object.keys(BASE_LABEL));

export function getStatusMeta(role, status) {
  if (!status) {
    return { color: { fg: '#475569', bg: '#e2e8f0', bd: '#cbd5e1' }, label: '-' };
  }

  if (REQUEST_STATES.has(status)) {
    return {
      color: REQUEST_COLOR[status] || { fg: '#334155', bg: '#e2e8f0', bd: '#cbd5e1' },
      label: REQUEST_LABEL[status] || status,
    };
  }

  if (ASSIGNMENT_STATES.has(status)) {
    const color =
      ROLE_COLOR[role]?.[status] ||
      ROLE_COLOR.ADMIN[status] ||
      { fg: '#475569', bg: '#e2e8f0', bd: '#94a3b8' };
    const label = BASE_LABEL[status] || status;
    return { color, label };
  }

  return { color: { fg: '#475569', bg: '#e2e8f0', bd: '#94a3b8' }, label: status };
}
