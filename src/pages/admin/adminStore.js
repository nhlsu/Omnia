const STORAGE_KEY = "omnia_admin_prototype_v1";

export const ADMIN_ID = "admin-1";

export const initialAdminData = {
  users: [
    { id: ADMIN_ID, name: "Omnia Admin", email: "admin@omnia.app", joinedAt: "2026-08-12", role: "Admin", status: "Active", registries: 0, gifts: 0 },
    { id: "user-1", name: "Sara Alqahtani", email: "sara.alqahtani@gmail.com", joinedAt: "2026-09-12", role: "Registry Owner", status: "Active", registries: 2, gifts: 14 },
    { id: "user-2", name: "Sarah Khalid", email: "sarah.khalid@gmail.com", joinedAt: "2026-10-04", role: "Registry Owner", status: "Active", registries: 1, gifts: 6 },
    { id: "user-3", name: "Lama Ahmed", email: "lama.ahmed@gmail.com", joinedAt: "2026-10-26", role: "Registry Owner", status: "Suspended", registries: 1, gifts: 3, suspensionReason: "Repeated spam reports" },
  ],
  registries: [
    { id: "registry-1", name: "Cheap phones?!", ownerId: "user-1", ownerName: "Sara Alqahtani", occasionTypeId: "occasion-1", visibility: "Public", isHidden: false, gifts: 4, createdAt: "2026-10-30" },
    { id: "registry-2", name: "Phones for Sara", ownerId: "user-2", ownerName: "Sarah Khalid", occasionTypeId: "occasion-2", visibility: "Public", isHidden: true, hiddenReason: "Reported as spam", gifts: 3, createdAt: "2026-11-02" },
    { id: "registry-3", name: "Baby shower wishes", ownerId: "user-1", ownerName: "Sara Alqahtani", occasionTypeId: "occasion-3", visibility: "Link only", isHidden: false, gifts: 7, createdAt: "2026-11-05" },
  ],
  gifts: [
    { id: "gift-1", registryId: "registry-1", name: "Instant camera", price: 420 },
    { id: "gift-2", registryId: "registry-1", name: "Headphones", price: 180 },
    { id: "gift-3", registryId: "registry-2", name: "Phone case", price: 95 },
    { id: "gift-4", registryId: "registry-3", name: "Baby blanket", price: 120 },
  ],
  reservations: [
    { id: "reservation-1", giftId: "gift-1", guestName: "Nadiah" },
    { id: "reservation-2", giftId: "gift-1", guestName: "Raghad" },
    { id: "reservation-3", giftId: "gift-3", guestName: "Guest" },
  ],
  contributions: [{ id: "contribution-1", giftId: "gift-1", amount: 50 }],
  notes: [{ id: "note-1", giftId: "gift-1", text: "I can order it on Thursday." }],
  reports: [
    { id: "report-1", type: "Wishlist", reason: "Spam or scam", reportedContent: "Cheap phones?!", registryId: "registry-1", reporter: "Guest", status: "Open", createdAt: "2026-11-12T10:24:00.000Z" },
    { id: "report-2", type: "Gift item", reason: "Inappropriate content", reportedContent: "Phone case", registryId: "registry-2", giftId: "gift-3", reporter: "Guest", status: "Open", createdAt: "2026-11-11T15:15:00.000Z" },
    { id: "report-3", type: "Wishlist", reason: "Other", reportedContent: "Phones for Sara", registryId: "registry-2", reporter: "Guest", status: "Closed", decision: "resolved", createdAt: "2026-11-08T09:00:00.000Z" },
  ],
  stores: [
    { id: "store-1", name: "Amazon.sa", domain: "amazon.sa", isActive: true },
    { id: "store-2", name: "Noon", domain: "noon.com", isActive: true },
    { id: "store-3", name: "Jarir", domain: "jarir.com", isActive: true },
    { id: "store-4", name: "Extra", domain: "extra.com", isActive: false },
  ],
  occasionTypes: [
    { id: "occasion-1", name: "Birthday", isActive: true },
    { id: "occasion-2", name: "Wedding", isActive: true },
    { id: "occasion-3", name: "Baby shower", isActive: true },
    { id: "occasion-4", name: "Graduation", isActive: true },
    { id: "occasion-5", name: "Eid", isActive: true },
    { id: "occasion-6", name: "Housewarming", isActive: false },
  ],
  notifications: [],
};

export function loadAdminData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialAdminData, ...JSON.parse(saved) } : initialAdminData;
  } catch {
    return initialAdminData;
  }
}

export function saveAdminData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetAdminData() {
  localStorage.removeItem(STORAGE_KEY);
  return initialAdminData;
}

export function updateUserStatus(data, userId, status, reason = "") {
  if (!["Active", "Suspended"].includes(status)) throw new Error("Choose a valid account status.");
  const user = data.users.find((item) => item.id === userId);
  if (!user) throw new Error("User not found.");
  if (status === "Suspended" && (userId === ADMIN_ID || user.role === "Admin")) {
    throw new Error("Administrators cannot suspend their own account or another admin.");
  }
  if (status === "Suspended" && !reason.trim()) throw new Error("A suspension reason is required.");
  return {
    ...data,
    users: data.users.map((item) => item.id === userId ? { ...item, status, suspensionReason: status === "Suspended" ? reason.trim() : "" } : item),
    registries: data.registries.map((item) => item.ownerId === userId ? { ...item, ownerSuspended: status === "Suspended" } : item),
  };
}

export function updateReportStatus(data, reportId, decision, action = "", note = "") {
  if (!["resolved", "dismissed"].includes(decision)) throw new Error("Choose Resolve or Dismiss.");
  return {
    ...data,
    reports: data.reports.map((report) => report.id === reportId ? {
      ...report, status: "Closed", decision, action, decisionNote: note.trim(), reviewedBy: "Omnia Admin", reviewedAt: new Date().toISOString(),
    } : report),
  };
}

export function setRegistryHidden(data, registryId, isHidden, reason = "") {
  const registry = data.registries.find((item) => item.id === registryId);
  if (!registry) throw new Error("Registry not found.");
  const next = {
    ...data,
    registries: data.registries.map((item) => item.id === registryId ? { ...item, isHidden, hiddenReason: isHidden ? reason.trim() : "" } : item),
  };
  if (isHidden) next.notifications = [...data.notifications, { id: crypto.randomUUID(), userId: registry.ownerId, message: "This wishlist was hidden for violating platform rules.", createdAt: new Date().toISOString() }];
  return next;
}

export function deleteGift(data, giftId, reason = "") {
  const gift = data.gifts.find((item) => item.id === giftId);
  if (!gift) throw new Error("Gift item not found.");
  const registry = data.registries.find((item) => item.id === gift.registryId);
  const next = {
    ...data,
    gifts: data.gifts.filter((item) => item.id !== giftId),
    reservations: data.reservations.filter((item) => item.giftId !== giftId),
    contributions: data.contributions.filter((item) => item.giftId !== giftId),
    notes: data.notes.filter((item) => item.giftId !== giftId),
    registries: data.registries.map((item) => item.id === gift.registryId ? { ...item, gifts: Math.max(0, item.gifts - 1) } : item),
  };
  if (registry) next.notifications = [...data.notifications, { id: crypto.randomUUID(), userId: registry.ownerId, message: `An item was removed from “${registry.name}”. Reason: ${reason.trim()}`, createdAt: new Date().toISOString() }];
  return next;
}

export function addStore(data, storeData) {
  const name = storeData.name.trim();
  const domain = storeData.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!name) throw new Error("Store name is required.");
  if (!/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) throw new Error("Enter a valid domain, such as example.com.");
  if (data.stores.some((item) => item.domain.toLowerCase() === domain)) throw new Error("This domain is already supported.");
  return { ...data, stores: [...data.stores, { id: crypto.randomUUID(), name, domain, isActive: true }] };
}

export function updateStore(data, storeId, changes) {
  if (!data.stores.some((item) => item.id === storeId)) throw new Error("Store not found.");
  const domain = changes.domain?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (domain && !/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) throw new Error("Enter a valid domain.");
  if (domain && data.stores.some((item) => item.id !== storeId && item.domain.toLowerCase() === domain)) throw new Error("This domain is already supported.");
  return { ...data, stores: data.stores.map((item) => item.id === storeId ? { ...item, ...changes, ...(domain ? { domain } : {}) } : item) };
}

export function addOccasionType(data, occasionData) {
  const name = occasionData.name.trim();
  if (name.length < 2 || name.length > 30) throw new Error("Occasion name must be 2–30 characters.");
  if (data.occasionTypes.some((item) => item.name.toLowerCase() === name.toLowerCase())) throw new Error("This occasion type already exists.");
  return { ...data, occasionTypes: [...data.occasionTypes, { id: crypto.randomUUID(), name, isActive: true }] };
}

export function updateOccasionType(data, occasionTypeId, changes) {
  if (!data.occasionTypes.some((item) => item.id === occasionTypeId)) throw new Error("Occasion type not found.");
  const name = changes.name?.trim();
  if (name && (name.length < 2 || name.length > 30)) throw new Error("Occasion name must be 2–30 characters.");
  if (name && data.occasionTypes.some((item) => item.id !== occasionTypeId && item.name.toLowerCase() === name.toLowerCase())) throw new Error("This occasion type already exists.");
  return { ...data, occasionTypes: data.occasionTypes.map((item) => item.id === occasionTypeId ? { ...item, ...changes, ...(name ? { name } : {}) } : item) };
}
