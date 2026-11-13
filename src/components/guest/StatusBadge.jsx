import { GIFT_STATUS } from "../../AppContext.jsx";
import "./StatusBadge.css";

// Label and colour group ("tone") for each gift status (G3). Colours live in StatusBadge.css.
const BADGES = {
  [GIFT_STATUS.AVAILABLE]: { label: "Available", tone: "success" },
  [GIFT_STATUS.PARTLY_RESERVED]: { label: "Partly reserved", tone: "warning" },
  [GIFT_STATUS.RESERVED]: { label: "Reserved", tone: "muted" },
  [GIFT_STATUS.GROUP_IN_PROGRESS]: { label: "Group gift in progress", tone: "primary" },
  [GIFT_STATUS.FULLY_FUNDED]: { label: "Fully funded", tone: "success" },
};

// Coloured pill showing a gift's status. Usage: <StatusBadge status={gift.status} />
function StatusBadge({ status }) {
  const badge = BADGES[status] || BADGES[GIFT_STATUS.AVAILABLE];

  return (
    <span className={`status-badge status-badge--${badge.tone}`}>
      {badge.label}
    </span>
  );
}

export default StatusBadge;