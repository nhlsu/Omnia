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
export const VISIBILITY = {
  PUBLIC: "public",
  LINK_ONLY: "linkOnly",
  PRIVATE: "private",
};

export const REGISTRY_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

export const NOTE_MAX_LENGTH = 200;

function buildRegistry(registryData) {
  return {
    ownerId: getCurrentUserId(),
    name: registryData.name?.trim() ?? "",
    occasionTypeId: registryData.occasionTypeId ?? null,
    date: registryData.date || null,
    note: registryData.note ? registryData.note.trim() : "",
    visibility: VISIBILITY.LINK_ONLY,
    status: REGISTRY_STATUS.DRAFT,
    isHidden: false,
  };
}

function buildGift(giftData) {
  return {
    registryId: giftData.registryId,
    name: giftData.name?.trim() ?? "",
       price:
      giftData.price === "" || giftData.price == null
        ? null
        : Number(giftData.price),
    quantity: Number(giftData.quantity) || 1,
    notes: giftData.notes?.trim() ?? "",
    imageUrl: giftData.imageUrl ?? null,
    productUrl: giftData.productUrl ?? null,
    storeName: giftData.storeName ?? null,
    isGroupGift: giftData.isGroupGift === true,
  };
}

// TEMPORARY: remove once a teammate adds the real current-user function in //Account Functions
function getCurrentUserId() {
  return "demo-owner";
}

// Shared checks for registry fields.
function validateRegistryFields(data, isDraft = false) {
  if (!data.name?.trim()) {
    throw new Error("Registry name is required.");
  }

  if (!isDraft && !data.occasionTypeId) {
    throw new Error("Occasion type is required.");
  }

  if (data.note && data.note.trim().length > NOTE_MAX_LENGTH) {
    throw new Error(`Note cannot exceed ${NOTE_MAX_LENGTH} characters.`);
  }

  if (
    data.visibility &&
    !Object.values(VISIBILITY).includes(data.visibility)
  ) {
    throw new Error("Invalid registry visibility.");
  }
}

// Create a registry.
export function createRegistry(registryData) {
  validateRegistryFields(registryData, false);

  return addRecord(STORAGE_KEYS.registries, buildRegistry(registryData));
}

// Save or update an unfinished registry.
export function saveRegistryDraft(registryData) {
  if (!registryData.id) {
    validateRegistryFields(registryData, true);

    return addRecord(
      STORAGE_KEYS.registries,
      buildRegistry(registryData)
    );
  }

  return updateRegistry(registryData.id, registryData);
}

// Update registry details, change visibility, or publish a draft.
export function updateRegistry(registryId, changes) {
  const registries = readList(STORAGE_KEYS.registries);
  const registryIndex = registries.findIndex(
    (registry) => registry.id === registryId
  );

  if (registryIndex === -1) {
    throw new Error("Registry not found.");
  }

  const current = registries[registryIndex];

  if (current.ownerId !== getCurrentUserId()) {
    throw new Error("Only the owner can update this registry.");
  }

  const { id, ownerId, isHidden, createdAt, ...safeChanges } = changes;

  const updated = {
    ...current,
    ...safeChanges,
    updatedAt: new Date().toISOString(),
  };

  validateRegistryFields(
    updated,
    updated.status === REGISTRY_STATUS.DRAFT
  );

  if (!Object.values(REGISTRY_STATUS).includes(updated.status)) {
    throw new Error("Invalid registry status.");
  }

  registries[registryIndex] = updated;
  saveList(STORAGE_KEYS.registries, registries);

  return updated;
}         

// Finds a registry and checks the current user owns it. Returns the registry.
// Used by every gift function, so the owner check is written once.
function getOwnedRegistry(registryId) {
  const registry = readList(STORAGE_KEYS.registries).find(
    (item) => item.id === registryId
  );

  if (!registry) {
    throw new Error("Registry not found.");
  }

  if (registry.ownerId !== getCurrentUserId()) {
    throw new Error("Only the owner can modify this registry.");
  }

  return registry;
}

// Shared checks for gift fields. `data` has already been through buildGift,
// so price and quantity are numbers or null here.
function validateGiftFields(data) {
  if (!data.name?.trim()) {
    throw new Error("Gift name is required.");
  }

  if (
    data.price !== null &&
    (!Number.isFinite(data.price) || data.price <= 0)
  ) {
    throw new Error("Price must be a valid amount.");
  }

  if (data.isGroupGift && data.price === null) {
    throw new Error("Group gifts need a price.");
  }

  if (!Number.isInteger(data.quantity) || data.quantity < 1) {
    throw new Error("Quantity must be a whole number of at least 1.");
  }
}
// Add a gift ([W7] "Save gift").
export function addGift(giftData) {
  getOwnedRegistry(giftData.registryId);

  const gift = buildGift(giftData);

  validateGiftFields(gift);

  return addRecord(STORAGE_KEYS.gifts, gift);
}
// Update gift details or quantity ([W9] Edit gift).
export function updateGift(giftId, changes) {
  const gifts = readList(STORAGE_KEYS.gifts);
  const giftIndex = gifts.findIndex((gift) => gift.id === giftId);

  if (giftIndex === -1) {
    throw new Error("Gift not found.");
  }

  const current = gifts[giftIndex];
  getOwnedRegistry(current.registryId);

  const { id, registryId, createdAt, ...safeChanges } = changes;

  const updated = {
    ...current,
    ...safeChanges,
    updatedAt: new Date().toISOString(),
  };

  if ("price" in changes) {
    updated.price = buildGift({ price: changes.price }).price;
  }

  if ("quantity" in changes) {
    updated.quantity = buildGift({ quantity: changes.quantity }).quantity;
  }

  if ("isGroupGift" in changes) {
    updated.isGroupGift = buildGift({
      isGroupGift: changes.isGroupGift,
    }).isGroupGift;
  }

  validateGiftFields(updated);

  gifts[giftIndex] = updated;
  saveList(STORAGE_KEYS.gifts, gifts);
  return updated;
}
// Remove a gift ([W9b] confirmation).
export function removeGift(giftId) {
  const gift = readList(STORAGE_KEYS.gifts).find(
    (item) => item.id === giftId
  );

  if (!gift) {
    throw new Error("Gift not found.");
  }

  getOwnedRegistry(gift.registryId);

  return deleteGift(giftId);
}
// Get the registry's sharing link ([W11] Share wishlist).
export function getRegistryLink(registryId) {
  const registry = getOwnedRegistry(registryId);

  if (registry.status !== REGISTRY_STATUS.PUBLISHED) {
    throw new Error("Publish your wishlist before sharing it.");
  }

  return `${window.location.origin}/wishlist/${registry.id}`;
}
// Owners can view hidden, private, and draft registries.
// Guests are blocked from hidden registries, while public registries remain openly viewable.
// Link-only registries require access through a shared link.
export function canViewRegistry(registryId, accessSource) {
  const registry = readList(STORAGE_KEYS.registries).find(
    (item) => item.id === registryId
  );
  if (!registry) {
    return false;
  }
  if (registry.ownerId === getCurrentUserId()) {
    return true;
  }
  if (
    registry.visibility === VISIBILITY.LINK_ONLY &&
    accessSource !== "link"
  ) {
    return false;
  }
  try {
    getOpenRegistry(registryId);
  } catch {
    return false;
  }
  return true;
}




// Owner's summary of one gift for W8: the status numbers, who reserved it, and how many pledged.
export function getGiftSummary(giftId) {
  const gift = readList(STORAGE_KEYS.gifts).find((item) => item.id === giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  // STEP 1: only the owner can see who reserved her gifts
  getOwnedRegistry(gift.registryId);

  // STEP 2: reuse the counting we already wrote for guests (don't redo it)
  const statusResult = getGiftStatus(giftId);

  // STEP 3: one name per reservation. Anonymous guests stay hidden from the owner (G8)
  const reservedBy = readList(STORAGE_KEYS.reservations)
    .filter((item) => item.giftId === giftId)
    .map((item) => (item.isAnonymous ? "A guest (anonymous)" : item.displayName));

  // STEP 4: how many people pledged to this gift ("Group gift · 3 contributors")
  const contributorCount = readList(STORAGE_KEYS.contributions)
    .filter((item) => item.giftId === giftId).length;

  return { ...statusResult, reservedBy, contributorCount };
}


// Everything W8 needs: the owner's wishlist, its gifts with summaries, and the overall progress.
export function getRegistryWithGifts(registryId) {

  // STEP 1: owner check. Owners can see drafts, private and hidden lists (unlike getGuestWishlist)
  const registry = getOwnedRegistry(registryId);

  // STEP 2: the occasion name (same as STEP 2 of getGuestWishlist)
  const occasion = readList(STORAGE_KEYS.occasionTypes).find(
    (item) => item.id === registry.occasionTypeId
  );

  // STEP 3: this wishlist's gifts, each merged with its owner summary
  const gifts = readList(STORAGE_KEYS.gifts)
    .filter((gift) => gift.registryId === registry.id)
    .map((gift) => ({ ...gift, ...getGiftSummary(gift.id) }));

  // STEP 4: totals for "5 of 12 gifts reserved · 42%"
  const totalUnits = gifts.reduce((total, gift) => total + gift.quantity, 0);
  const reservedUnits = gifts.reduce((total, gift) => total + gift.reservedUnits, 0);
  const percent = totalUnits === 0 ? 0 : Math.round((reservedUnits / totalUnits) * 100);

  return {
    registry,
    occasionName: occasion ? occasion.name : "",
    gifts,
    totalUnits,
    reservedUnits,
    percent,
  };
}


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
  if (registry.visibility !== VISIBILITY.PUBLIC) {
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

  if (
  !registry ||
  registry.visibility === VISIBILITY.PRIVATE ||
  registry.status === REGISTRY_STATUS.DRAFT ||
  registry.isHidden
) {
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




// Post a note in a group gift thread (G7). Only guests who pledged to THIS gift can post.
export function addNote(noteData) {

  // STEP 1: the note can't be empty and is at most 300 characters
  const text = noteData?.text ? noteData.text.trim() : "";

  if (!text) {
    throw new Error("Please write a note.");
  }

  if (text.length > 300) {
    throw new Error("Notes must be 300 characters or fewer.");
  }

  // STEP 2: the writer must have pledged to THIS gift (their contributionId is the "ticket")
  const contributions = readList(STORAGE_KEYS.contributions);
  const contribution = contributions.find(
    (item) => item.id === noteData.contributionId && item.giftId === noteData.giftId
  );

  if (!contribution) {
    throw new Error("Only contributors to this gift can post notes.");
  }

  // STEP 3: save the note. The author's name comes from their pledge, not from the page
  return addRecord(STORAGE_KEYS.notes, {
    giftId: contribution.giftId,
    contributionId: contribution.id,
    authorName: contribution.displayName,
    text,
  });
}






export const GIFT_STATUS = {
  AVAILABLE: "available",
  PARTLY_RESERVED: "partlyReserved",
  RESERVED: "reserved",
  GROUP_IN_PROGRESS: "groupInProgress",
  FULLY_FUNDED: "fullyFunded",
};

// Work out a gift's status from its reservations and pledges (G3). Nothing is stored.
export function getGiftStatus(giftId) {
  const gift = readList(STORAGE_KEYS.gifts).find((item) => item.id === giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  // STEP 1: count reserved units and pledged money for THIS gift
  const quantity = gift.quantity || 1;

  const reservedUnits = readList(STORAGE_KEYS.reservations)
    .filter((item) => item.giftId === giftId)
    .reduce((total, item) => total + item.units, 0);

  const pledged = readList(STORAGE_KEYS.contributions)
    .filter((item) => item.giftId === giftId)
    .reduce((total, item) => total + item.amount, 0);

  // STEP 2: decide the status (group gift first, then reservations)
  let status;

  if (pledged > 0) {
    status = pledged >= gift.price ? GIFT_STATUS.FULLY_FUNDED : GIFT_STATUS.GROUP_IN_PROGRESS;
  } else if (reservedUnits >= quantity) {
    status = GIFT_STATUS.RESERVED;
  } else if (reservedUnits > 0) {
    status = GIFT_STATUS.PARTLY_RESERVED;
  } else {
    status = GIFT_STATUS.AVAILABLE;
  }

  // STEP 3: return the status AND the numbers the screens need (e.g. "1 of 3 reserved", progress bar)
  return {
    status,
    quantity,
    reservedUnits,
    pledged,
    remaining: Math.round(((gift.price || 0) - pledged) * 100) / 100,
  };
}

// Everything W12 needs: the wishlist, its occasion name, and its gifts with their status (G1, G3).
export function getGuestWishlist(registryId) {

  // STEP 1: the wishlist must be open to guests (throws -> the page shows W12b)
  const registry = getOpenRegistry(registryId);

  // STEP 2: find the occasion name (the registry only stores its id)
  const occasion = readList(STORAGE_KEYS.occasionTypes).find(
    (item) => item.id === registry.occasionTypeId
  );

  // STEP 3: this wishlist's gifts, each one with its status added
  const gifts = readList(STORAGE_KEYS.gifts)
    .filter((gift) => gift.registryId === registry.id)
    .map((gift) => ({ ...gift, ...getGiftStatus(gift.id) }));

  // STEP 4: the owner's first name, for "Elham's birthday" and "A note from Elham"
  const owner = readList(STORAGE_KEYS.users).find((user) => user.id === registry.ownerId);
  const ownerName = owner?.fullName ? owner.fullName.split(" ")[0] : "";

  return {
    registry,
    occasionName: occasion ? occasion.name : "",
    ownerName,
    gifts,
  };
}

// Notes in a group gift thread, oldest first (G7). Only contributors to this gift can read them.
export function getGiftNotes(giftId, contributionId) {

  // STEP 1: the reader must have pledged to THIS gift (same "ticket" check as addNote)
  const isContributor = readList(STORAGE_KEYS.contributions).some(
    (item) => item.id === contributionId && item.giftId === giftId
  );

  if (!isContributor) {
    throw new Error("Only contributors to this gift can see notes.");
  }

  // STEP 2: this gift's notes, oldest first like a chat
  return readList(STORAGE_KEYS.notes)
    .filter((note) => note.giftId === giftId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}



// Contributors of a group gift for W17 (G6, G8). Anonymous names are hidden from the owner only.
export function getGiftContributors(giftId) {

  // STEP 1: the gift exists and its wishlist is open to guests
  const gift = readList(STORAGE_KEYS.gifts).find((item) => item.id === giftId);

  if (!gift) {
    throw new Error("Gift not found.");
  }

  getOpenRegistry(gift.registryId);

  // STEP 2: this gift's pledges, oldest first, with ONLY the safe fields
  return readList(STORAGE_KEYS.contributions)
    .filter((item) => item.giftId === giftId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((item) => ({
      displayName: item.displayName,
      amount: item.amount,
      isAnonymous: item.isAnonymous,
    }));
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