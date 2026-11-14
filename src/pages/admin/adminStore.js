// Adapter for the admin UI. All reads and changes use AppContext's shared data.
import {
  getAdminData,
  updateUserStatus as sharedUpdateUserStatus,
  updateReportStatus as sharedUpdateReportStatus,
  setRegistryHidden as sharedSetRegistryHidden,
  deleteGift as sharedDeleteGift,
  addStore as sharedAddStore,
  updateStore as sharedUpdateStore,
  addOccasionType as sharedAddOccasionType,
  updateOccasionType as sharedUpdateOccasionType,
} from "../../AppContext";

// Display labels are mapped here; stored values stay lowercase.
export function loadAdminData() {
  const data = getAdminData();
  const users = data.users.map((user) => {
    const registries = data.registries.filter((item) => item.ownerId === user.id);
    const registryIds = new Set(registries.map((item) => item.id));
    return {
      ...user,
      joinedAt: user.createdAt || user.joinedAt || null,
      role: String(user.role).toLowerCase() === "admin" ? "Admin" : "Registry Owner",
      status: user.status === "suspended" ? "Suspended" : "Active",
      registries: registries.length,
      gifts: data.gifts.filter((gift) => registryIds.has(gift.registryId)).length,
    };
  });
  const registries = data.registries.map((registry) => ({
    ...registry,
    ownerName: data.users.find((user) => user.id === registry.ownerId)?.name || "Unknown owner",
    visibility: { public: "Public", linkOnly: "Link only", private: "Private" }[registry.visibility] || registry.visibility,
    gifts: data.gifts.filter((gift) => gift.registryId === registry.id).length,
  }));
  const reports = data.reports.map((report) => {
    const giftId = report.giftId || (report.targetType === "gift" ? report.targetId : null);
    const gift = data.gifts.find((item) => item.id === giftId);
    const registryId = report.registryId || gift?.registryId ||
      (report.targetType === "registry" ? report.targetId : null);
    const registry = data.registries.find((item) => item.id === registryId);
    const isGift = Boolean(giftId) || report.type === "gift" || report.targetType === "gift";
    const closed = ["resolved", "dismissed"].includes(report.status);
    return {
      ...report, giftId, registryId,
      type: isGift ? "Gift item" : "Wishlist",
      status: closed ? "Closed" : "Open",
      decision: closed ? report.status : null,
      reportedContent: (isGift ? gift?.name : registry?.name) || report.reportedContent || "Content no longer available",
      reporter: report.reporter || "Guest",
    };
  });
  return { ...data, users, registries, reports };
}

// The first argument is the UI snapshot for compatibility with AdminPage.
// Operations never save that snapshot; they always update the shared records.
export function updateUserStatus(_data, userId, status, reason = "") {
  if (!["Active", "Suspended"].includes(status)) throw new Error("Choose a valid account status.");
  if (status === "Suspended" && !reason.trim()) throw new Error("A suspension reason is required.");
  sharedUpdateUserStatus(userId, status.toLowerCase(), reason);
  return loadAdminData();
}

export function updateReportStatus(_data, reportId, decision, action = "", note = "") {
  sharedUpdateReportStatus(reportId, decision, { action, note });
  return loadAdminData();
}

export function setRegistryHidden(_data, registryId, isHidden, reason = "") {
  sharedSetRegistryHidden(registryId, isHidden, reason);
  return loadAdminData();
}

export function deleteGift(_data, giftId) {
  sharedDeleteGift(giftId);
  return loadAdminData();
}

export function addStore(_data, storeData) {
  sharedAddStore(storeData);
  return loadAdminData();
}

export function updateStore(_data, storeId, changes) {
  sharedUpdateStore(storeId, changes);
  return loadAdminData();
}

export function addOccasionType(_data, occasionData) {
  sharedAddOccasionType(occasionData);
  return loadAdminData();
}

export function updateOccasionType(_data, occasionTypeId, changes) {
  sharedUpdateOccasionType(occasionTypeId, changes);
  return loadAdminData();
}