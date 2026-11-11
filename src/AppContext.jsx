//Helper Functions
const STORAGE_KEYS = {
  gifts: "omnia_gifts",
  reservations: "omnia_reservations",
  contributions: "omnia_contributions",
  notes: "omnia_notes",
  users: "omnia_users",
  reports: "omnia_reports",
  registries: "omnia_registries",
  stores: "omnia_supported_stores",
  occasionTypes: "omnia_occasion_types",
};

function readList(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : [];
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
  return list;
}

function createId() {
  return crypto.randomUUID();
}

function addRecord(key, data) {
  const records = readList(key);

  const record = {
    id: createId(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  saveList(key, [...records, record]);
  return record;
}

//Account Functions






//Registry Owner Functions







//Guest Functions







//Admin Functions


// Delete a gift and its related reservations, contributions, and notes.
export function deleteGift(giftId) {
  const gifts = readList(STORAGE_KEYS.gifts);
  const gift = gifts.find((item) => item.id === giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  saveList(
    STORAGE_KEYS.gifts,
    gifts.filter((item) => item.id !== giftId)
  );

  const reservations = readList(STORAGE_KEYS.reservations);
  saveList(
    STORAGE_KEYS.reservations,
    reservations.filter((item) => item.giftId !== giftId)
  );

  const contributions = readList(STORAGE_KEYS.contributions);
  saveList(
    STORAGE_KEYS.contributions,
    contributions.filter((item) => item.giftId !== giftId)
  );

  const notes = readList(STORAGE_KEYS.notes);
  saveList(
    STORAGE_KEYS.notes,
    notes.filter((item) => item.giftId !== giftId)
  );

  return { success: true, deletedGift: gift };
}

// Suspend or reactivate a user account.
export function updateUserStatus(userId, status) {
  if (!["active", "suspended"].includes(status)) {
    throw new Error("Status must be 'active' or 'suspended'.");
  }

  const users = readList(STORAGE_KEYS.users);
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found.");
  }

  users[userIndex] = {
    ...users[userIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveList(STORAGE_KEYS.users, users);
  return users[userIndex];
}

// Mark a report as resolved or dismissed.
export function updateReportStatus(reportId, status) {
  if (!["resolved", "dismissed"].includes(status)) {
    throw new Error("Status must be 'resolved' or 'dismissed'.");
  }

  const reports = readList(STORAGE_KEYS.reports);
  const reportIndex = reports.findIndex((report) => report.id === reportId);

  if (reportIndex === -1) {
    throw new Error("Report not found.");
  }

  reports[reportIndex] = {
    ...reports[reportIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveList(STORAGE_KEYS.reports, reports);
  return reports[reportIndex];
}

// Hide or restore a registry.
export function setRegistryHidden(registryId, isHidden) {
  if (typeof isHidden !== "boolean") {
    throw new Error("isHidden must be true or false.");
  }

  const registries = readList(STORAGE_KEYS.registries);
  const registryIndex = registries.findIndex(
    (registry) => registry.id === registryId
  );

  if (registryIndex === -1) {
    throw new Error("Registry not found.");
  }

  registries[registryIndex] = {
    ...registries[registryIndex],
    isHidden,
    updatedAt: new Date().toISOString(),
  };

  saveList(STORAGE_KEYS.registries, registries);
  return registries[registryIndex];
}

// Add a supported store.
export function addStore(storeData) {
  if (!storeData || !storeData.name) {
    throw new Error("Store name is required.");
  }

  const stores = readList(STORAGE_KEYS.stores);
  const alreadyExists = stores.some(
    (store) => store.name.toLowerCase() === storeData.name.toLowerCase()
  );

  if (alreadyExists) {
    throw new Error("This store already exists.");
  }

  return addRecord(STORAGE_KEYS.stores, {
    ...storeData,
    isActive: true,
  });
}

// Update a store or deactivate it by setting isActive to false.
export function updateStore(storeId, changes) {
  const stores = readList(STORAGE_KEYS.stores);
  const storeIndex = stores.findIndex((store) => store.id === storeId);

  if (storeIndex === -1) {
    throw new Error("Store not found.");
  }

  stores[storeIndex] = {
    ...stores[storeIndex],
    ...changes,
    id: storeId,
    updatedAt: new Date().toISOString(),
  };

  saveList(STORAGE_KEYS.stores, stores);
  return stores[storeIndex];
}

// Add an occasion type.
export function addOccasionType(occasionData) {
  if (!occasionData || !occasionData.name) {
    throw new Error("Occasion type name is required.");
  }

  const occasionTypes = readList(STORAGE_KEYS.occasionTypes);
  const alreadyExists = occasionTypes.some(
    (occasion) =>
      occasion.name.toLowerCase() === occasionData.name.toLowerCase()
  );

  if (alreadyExists) {
    throw new Error("This occasion type already exists.");
  }

  return addRecord(STORAGE_KEYS.occasionTypes, {
    ...occasionData,
    isActive: true,
  });
}

// Update an occasion type or deactivate it by setting isActive to false.
export function updateOccasionType(occasionTypeId, changes) {
  const occasionTypes = readList(STORAGE_KEYS.occasionTypes);
  const occasionIndex = occasionTypes.findIndex(
    (occasion) => occasion.id === occasionTypeId
  );

  if (occasionIndex === -1) {
    throw new Error("Occasion type not found.");
  }

  occasionTypes[occasionIndex] = {
    ...occasionTypes[occasionIndex],
    ...changes,
    id: occasionTypeId,
    updatedAt: new Date().toISOString(),
  };

  saveList(STORAGE_KEYS.occasionTypes, occasionTypes);
  return occasionTypes[occasionIndex];
}