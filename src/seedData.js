
const DEMO_PASSWORD = "Omnia1234";

const DEMO_USERS = [
  {
    id: "demo-owner",
    name: "Demo Owner",
    email: "owner@omnia.test",
    role: "owner"
  },
  {
    id: "demo-admin",
    name: "Demo Admin",
    email: "admin@omnia.test",
    role: "admin"
  }
];

// Read existing records
function readRecords(key) {
  const records = JSON.parse(localStorage.getItem(key) || "[]");

  if (!Array.isArray(records)) {
    throw new Error(`Invalid data in ${key}`);
  }

  return records;
}

// Add demo records without duplicating existing ones
function addMissing(key, records) {
  const current = readRecords(key);
  const ids = new Set(current.map((record) => record.id));
  const missing = records.filter((record) => !ids.has(record.id));

  if (missing.length) {
    localStorage.setItem(key, JSON.stringify([...current, ...missing]));
  }

  return missing.length;
}

function toHex(bytes) {
  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

// Hash demo passwords to match AppContext.jsx
async function createDemoUser(user, createdAt) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(DEMO_PASSWORD),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256"
    },
    key,
    256
  );

  return {
    ...user,
    passwordSalt: toHex(salt),
    passwordHash: toHex(new Uint8Array(bits)),
    status: "active",
    failedAttempts: 0,
    lockedUntil: null,
    createdAt
  };
}

// Run this function to insert demo data
export async function seedDemoData() {
  if (!import.meta.env.DEV) {
    throw new Error("Demo data is only for development.");
  }

  const now = new Date().toISOString();
  const existingUsers = readRecords("omnia_users");

  for (const user of DEMO_USERS) {
    if (existingUsers.some((item) =>
      item.email?.toLowerCase() === user.email &&
      item.id !== user.id
    )) {
      throw new Error(`Demo email is already in use: ${user.email}`);
    }
  }

  const usersToCreate = DEMO_USERS.filter((user) =>
    !existingUsers.some((item) => item.id === user.id)
  );

  const newUsers = await Promise.all(
    usersToCreate.map((user) => createDemoUser(user, now))
  );

  const counts = {
    users: addMissing("omnia_users", newUsers)
  };

  // Occasion types
  counts.occasionTypes = addMissing("omnia_occasion_types", [
    {
      id: "occasion-grad",
      name: "Graduation",
      isActive: true,
      createdAt: now
    },
    {
      id: "occasion-birthday",
      name: "Birthday",
      isActive: true,
      createdAt: now
    }
  ]);

  // Supported stores
  counts.stores = addMissing("omnia_supported_stores", [
    {
      id: "store-gifts",
      name: "Demo Gift Shop",
      domain: "gifts.example",
      isActive: true,
      createdAt: now
    },
    {
      id: "store-home",
      name: "Demo Home Shop",
      domain: "home.example",
      isActive: true,
      createdAt: now
    }
  ]);

  // Owner wishlists
  counts.registries = addMissing("omnia_registries", [
    {
      id: "registry-grad",
      ownerId: "demo-owner",
      name: "Graduation Wishlist",
      occasionTypeId: "occasion-grad",
      date: "2027-06-01",
      note: "Graduation gift ideas",
      visibility: "linkOnly",
      status: "published",
      isHidden: false,
      createdAt: now
    },
    {
      id: "registry-birthday",
      ownerId: "demo-owner",
      name: "Birthday Wishlist",
      occasionTypeId: "occasion-birthday",
      date: "2027-02-20",
      note: "Birthday gift ideas",
      visibility: "public",
      status: "published",
      isHidden: false,
      createdAt: now
    }
  ]);

  // Gifts
  counts.gifts = addMissing("omnia_gifts", [
    {
      id: "gift-headphones",
      registryId: "registry-grad",
      name: "Headphones",
      price: 300,
      quantity: 2,
      notes: "Any neutral color",
      imageUrl: null,
      productUrl: null,
      storeName: "Demo Gift Shop",
      isGroupGift: false,
      createdAt: now
    },
    {
      id: "gift-laptop",
      registryId: "registry-grad",
      name: "Laptop",
      price: 1200,
      quantity: 1,
      notes: "Group gift",
      imageUrl: null,
      productUrl: null,
      storeName: "Demo Gift Shop",
      isGroupGift: true,
      createdAt: now
    },
    {
      id: "gift-books",
      registryId: "registry-birthday",
      name: "Books",
      price: 100,
      quantity: 1,
      notes: "A surprise book",
      imageUrl: null,
      productUrl: null,
      storeName: "Demo Gift Shop",
      isGroupGift: false,
      createdAt: now
    }
  ]);

  // One reserved gift
  counts.reservations = addMissing("omnia_reservations", [
    {
      id: "reservation-1",
      giftId: "gift-headphones",
      registryId: "registry-grad",
      displayName: "Demo Guest",
      email: "guest@example.com",
      units: 1,
      isAnonymous: false,
      code: "K7Q2MZ",
      createdAt: now
    }
  ]);

  // Group gift contributions
  counts.contributions = addMissing("omnia_contributions", [
    {
      id: "contribution-1",
      giftId: "gift-laptop",
      registryId: "registry-grad",
      displayName: "Demo Contributor",
      email: "contributor@example.com",
      amount: 200,
      isAnonymous: false,
      createdAt: now
    },
    {
      id: "contribution-2",
      giftId: "gift-laptop",
      registryId: "registry-grad",
      displayName: "Anonymous Guest",
      email: "another@example.com",
      amount: 100,
      isAnonymous: true,
      createdAt: now
    }
  ]);

  // Group gift note
  counts.notes = addMissing("omnia_notes", [
    {
      id: "note-1",
      giftId: "gift-laptop",
      contributionId: "contribution-1",
      authorName: "Demo Contributor",
      text: "Happy graduation!",
      createdAt: now
    }
  ]);

  // Sample admin report
  counts.reports = addMissing("omnia_reports", [
    {
      id: "report-1",
      registryId: "registry-birthday",
      giftId: null,
      type: "registry",
      reason: "other",
      details: "Sample report for admin review",
      status: "open",
      createdAt: now
    }
  ]);

  window.dispatchEvent(new Event("omnia:data-changed"));

  return counts;
}
