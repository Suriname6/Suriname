import React from 'react';
import styles from '../../css/Request/StatusBadge.module.css';
import { getStatusMeta } from './StatusMeta';

export default function StatusBadge({ role, status }) {
    const { color, label } = getStatusMeta(role, status);
    const styleVars = {
        '--fg': color.fg,
        '--bg': color.bg,
        '--bd': color.bd,
    };
    return (
        <span className={styles.badge} style={styleVars}>
      <i className={styles.dot} />
            {label}
    </span>
    );
}
