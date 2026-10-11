// Centralised API client – all calls go through here.
// Base URL is proxied via Vite in dev; override with VITE_API_URL in .env

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/** POST /forecast – Returns { predicted_demand, model_name, message } */
export async function postForecast(payload) {
  return apiFetch('/forecast/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * POST /inventory – Returns {
 *   safety_stock, reorder_point, recommended_order_quantity,
 *   risk_score, risk_level, recommendation
 * }
 */
export async function postInventory(payload) {
  return apiFetch('/inventory/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** GET /health – { status: "healthy" } */
export async function getHealth() {
  return apiFetch('/health');
}
