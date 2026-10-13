// Centralised API client – all calls go through here.
// Base URL is proxied via Vite in dev; override with VITE_API_URL in .env

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function apiFetch(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    let message = '';
    if (errorBody && errorBody.detail) {
      if (Array.isArray(errorBody.detail)) {
        // Format FastAPI / Pydantic validation error list
        message = errorBody.detail
          .map((item) => {
            const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : 'field';
            return `${field}: ${item.msg}`;
          })
          .join('; ');
      } else if (typeof errorBody.detail === 'string') {
        message = errorBody.detail;
      }
    } else if (errorBody && errorBody.message) {
      message = errorBody.message;
    }
    throw new Error(message || `HTTP ${res.status} ${res.statusText}`);
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

/**
 * POST /pricing – Returns {
 *   item_id, current_price, suggested_price, price_change_percent,
 *   current_revenue, projected_revenue, price_down_revenue, price_up_revenue,
 *   revenue_uplift, revenue_uplift_percent, recommendation, message
 * }
 */
export async function postPricing(payload) {
  return apiFetch('/pricing/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

