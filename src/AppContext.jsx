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

// Report a public wishlist or one of its gifts (W19). Saved as "open" for the admin.
export function submitReport(reportData) {

  // STEP 1: a reason must be chosen, and it must be one of the allowed ones
  const allowedReasons = ["inappropriate", "spam", "other"];

  if (!reportData || !allowedReasons.includes(reportData.reason)) {
    throw new Error("Please select a reason.");
  }

  // STEP 2: details are optional, but at most 300 characters
  const details = reportData.details ? reportData.details.trim() : "";

  if (details.length > 300) {
    throw new Error("Details must be 300 characters or fewer.");
  }

  // STEP 3: find the registry being reported
  const registries = readList(STORAGE_KEYS.registries);
  const registry = registries.find((item) => item.id === reportData.registryId);

  if (!registry) {
    throw new Error("Wishlist not found.");
  }

  // STEP 4: only PUBLIC wishlists can be reported
  if (registry.visibility !== "public") {
    throw new Error("Only public wishlists can be reported.");
  }

  // STEP 5: if one gift is reported, it must belong to this registry
  if (reportData.giftId) {
    const gifts = readList(STORAGE_KEYS.gifts);
    const gift = gifts.find(
      (item) => item.id === reportData.giftId && item.registryId === registry.id
    );

    if (!gift) {
      throw new Error("Gift not found in this wishlist.");
    }
  }

  // STEP 6: save the report and return it
  return addRecord(STORAGE_KEYS.reports, {
    registryId: registry.id,
    giftId: reportData.giftId || null,
    type: reportData.giftId ? "gift" : "registry",
    reason: reportData.reason,
    details: details,
    status: "open",
  });
}




// Make a random 6-character code (like "K7Q2MZ") that no other reservation uses.
function createReservationCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const reservations = readList(STORAGE_KEYS.reservations);
  let code;

  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
  } while (reservations.some((item) => item.code === code));

  return code;
}




// Find a wishlist guests are allowed to open (G1): exists, not private, not hidden, owner not suspended.
function getOpenRegistry(registryId) {
  const registries = readList(STORAGE_KEYS.registries);
  const registry = registries.find((item) => item.id === registryId);

  if (!registry || registry.visibility === "private" || registry.isHidden) {
    throw new Error("This wishlist isn't available.");
  }

  const users = readList(STORAGE_KEYS.users);
  const owner = users.find((user) => user.id === registry.ownerId);

  if (owner && owner.status === "suspended") {
    throw new Error("This wishlist isn't available.");
  }

  return registry;
}





// Reserve an available gift (G4). Rechecks availability right before saving.
export function reserveGift(reservationData) {

  // STEP 1: name and email are required
  const displayName = reservationData?.displayName ? reservationData.displayName.trim() : "";
  const email = reservationData?.email ? reservationData.email.trim().toLowerCase() : "";

  if (!displayName) {
    throw new Error("Please enter your name.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  // STEP 2: units must be a whole number, at least 1 (default 1)
  const units = reservationData.units === undefined ? 1 : Number(reservationData.units);
  if (!Number.isInteger(units) || units < 1) {
    throw new Error("Please choose at least 1 unit.");
  }

  // STEP 3: the gift exists and its wishlist is open to guests
  const gifts = readList(STORAGE_KEYS.gifts);
  const gift = gifts.find((item) => item.id === reservationData.giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  getOpenRegistry(gift.registryId);

  // STEP 4: a gift is EITHER reserved OR a group gift, never both
  const contributions = readList(STORAGE_KEYS.contributions);
  const hasGroupGift = contributions.some((item) => item.giftId === gift.id);

  if (hasGroupGift) {
    throw new Error("This gift is a group gift. Join the group gift instead.");
  }

  // STEP 5: RECHECK availability at the moment of saving (the most important part)
  const reservations = readList(STORAGE_KEYS.reservations);
  const giftReservations = reservations.filter((item) => item.giftId === gift.id);
  const reservedUnits = giftReservations.reduce((total, item) => total + item.units, 0);
  const quantity = gift.quantity || 1;
  const availableUnits = quantity - reservedUnits;

  if (availableUnits <= 0) {
    throw new Error("Someone just reserved this gift.");
  }

  if (units > availableUnits) {
    throw new Error(`Only ${availableUnits} left to reserve.`);
  }

  // STEP 6: save the reservation with a unique code
  return addRecord(STORAGE_KEYS.reservations, {
    giftId: gift.id,
    registryId: gift.registryId,
    displayName,
    email,
    units,
    isAnonymous: reservationData.isAnonymous === true,
    code: createReservationCode(),
  });
}





// Find a guest's reservation on this wishlist using the 6-character code (G5, W16).
export function findReservationByCode(code, registryId) {

  // STEP 1: clean the code so "  k7q2mz " works the same as "K7Q2MZ"
  const cleanCode = code ? code.trim().toUpperCase() : "";

  if (cleanCode.length !== 6) {
    throw new Error("We couldn't find a reservation with this code.");
  }

  // STEP 2: the code must match a reservation ON THIS wishlist
  const reservations = readList(STORAGE_KEYS.reservations);
  const reservation = reservations.find(
    (item) => item.code === cleanCode && item.registryId === registryId
  );

  if (!reservation) {
    throw new Error("We couldn't find a reservation with this code.");
  }

  return reservation;
}







// Cancel a reservation (G5). The gift goes back to Available automatically.
export function cancelReservation(reservationId) {
  const reservations = readList(STORAGE_KEYS.reservations);
  const reservation = reservations.find((item) => item.id === reservationId);

  if (!reservation) {
    throw new Error("We couldn't find a reservation with this code.");
  }

  saveList(
    STORAGE_KEYS.reservations,
    reservations.filter((item) => item.id !== reservationId)
  );

  return reservation;
}



// Add a pledge to a group gift (G6, G8). Omnia records pledges only, no payments.
export function addContribution(contributionData) {

  // STEP 1: name is required
  const displayName = contributionData?.displayName ? contributionData.displayName.trim() : "";

  if (!displayName) {
    throw new Error("Please enter your name.");
  }

  // STEP 2: amount must be a real number above 0
  const amount = Number(contributionData.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please enter a valid amount.");
  }

  // STEP 3: the gift exists, HAS A PRICE, and its wishlist is open
  const gifts = readList(STORAGE_KEYS.gifts);
  const gift = gifts.find((item) => item.id === contributionData.giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  if (!gift.price) {
    throw new Error("Group gifts are only for gifts with a price.");
  }

  getOpenRegistry(gift.registryId);

  // STEP 4: the opposite of reserveGift's STEP 4: no normal reservations allowed
  const reservations = readList(STORAGE_KEYS.reservations);
  const isReserved = reservations.some((item) => item.giftId === gift.id);

  if (isReserved) {
    throw new Error("This gift is already reserved.");
  }


    // STEP 5: how much is still needed?
  const contributions = readList(STORAGE_KEYS.contributions);
  const pledged = contributions
    .filter((item) => item.giftId === gift.id)
    .reduce((total, item) => total + item.amount, 0);
  const remaining = Math.round((gift.price - pledged) * 100) / 100;
  if (remaining <= 0) {
    throw new Error("This gift is fully funded. Pledges are closed.");
  }

  // STEP 6: minimum SAR 50, unless less than 50 is left (then the rest is allowed)
  const minimum = Math.min(50, remaining);

  if (amount < minimum) {
    throw new Error(`Minimum contribution is SAR ${minimum}.`);
  }

  if (amount > remaining) {
    throw new Error(`Maximum is SAR ${remaining}.`);
  }

  // STEP 7: save the pledge
  return addRecord(STORAGE_KEYS.contributions, {
    giftId: gift.id,
    registryId: gift.registryId,
    displayName,
    email: contributionData.email ? contributionData.email.trim().toLowerCase() : "",
    amount,
    isAnonymous: contributionData.isAnonymous === true,
  });
}






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