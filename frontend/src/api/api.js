// src/api/api.js

// ✅ CONFIGURATION (Only declare this once!)
// Use an environment variable so deployments (e.g. Vercel) can point to the correct backend.
// In Vercel, set REACT_APP_API_BASE_URL to something like "https://your-backend-domain.com/api".
export const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://maritimevesseltracking.onrender.com/api";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", 
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJsonWithRetry(url, options, retries = 1, delay = 1500) {
  try {
    const res = await fetch(url, options);
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) {
      if (retries > 0 && (res.status === 502 || res.status === 503 || res.status === 504)) {
        await sleep(delay);
        return fetchJsonWithRetry(url, options, retries - 1, delay);
      }
      const data = ct.includes("application/json") ? await res.json() : { detail: await res.text() };
      throw { status: res.status, data };
    }
    return ct.includes("application/json") ? await res.json() : await res.text();
  } catch (e) {
    if (retries > 0) {
      await sleep(delay);
      return fetchJsonWithRetry(url, options, retries - 1, delay);
    }
    throw e;
  }
}

// --- DATA FETCHING ---

export async function fetchLiveVessels() {
  try {
    const res = await fetch(`${API_BASE}/vessels/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch vessels");
    return await res.json();
  } catch (err) {
    console.error("API Error (Vessels):", err);
    return [];
  }
}

export async function fetchRiskZones() {
  try {
    const res = await fetch(`${API_BASE}/risks/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch risks");
    return await res.json();
  } catch (err) {
    console.error("API Error (Risks):", err);
    return [];
  }
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (err) {
    console.error("API Error (Stats):", err);
    return {}; 
  }
}

export async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/users/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (err) {
    console.error("API Error (Users):", err);
    return [];
  }
}

export async function fetchAuditLogs() {
  try {
    const res = await fetch(`${API_BASE}/audit-logs/`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch logs");
    return await res.json();
  } catch (err) {
    console.error("API Error (Logs):", err);
    return [];
  }
}

// --- AUTH & ACTIONS ---

export async function loginUser(credentials) {
  try {
    return await fetchJsonWithRetry(
      `${API_BASE}/login/`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      },
      1,
      1500
    );
  } catch (err) {
    if (err && err.data) return err.data;
    return { detail: "Network error" };
  }
}

export async function deleteUser(userId) {
    await fetch(`${API_BASE}/users/${userId}/delete/`, {
        method: "DELETE",
        headers: getHeaders()
    });
}

export async function toggleUserStatus(userId) {
    await fetch(`${API_BASE}/users/${userId}/status/`, {
        method: "POST",
        headers: getHeaders()
    });
}

export async function updateUserRole(userId, newRole) {
    await fetch(`${API_BASE}/users/${userId}/role/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ role: newRole })
    });
}

// --- ALERTS SYSTEM ---

// ✅ NEW: Broadcast Alert (For Admin)
export async function broadcastAlert(alertData) {
    try {
        const res = await fetch(`${API_BASE}/alerts/create/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(alertData)
        });
        if (!res.ok) throw new Error("Failed to broadcast alert");
        return await res.json();
    } catch (err) {
        console.error("API Error (Broadcast):", err);
        return null;
    }
}
