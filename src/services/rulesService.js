/**
 * Central Rules API Service
 * Manages fetching & persisting custom moderation rules & blacklisted keywords
 * to the central backend server (http://localhost:5000/api/rules).
 */

const RULES_API_URL = 'http://localhost:5000/api/rules';
const LOCAL_STORAGE_KEY = 'aegis_rules_config';

/**
 * Fetches central rules from server. Falls back to localStorage or default config.
 */
export async function fetchCentralRules(defaultConfig) {
  try {
    const response = await fetch(RULES_API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.rules) {
        // Cache to localStorage for offline fallback
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.rules));
        return {
          rules: data.rules,
          isSyncedWithServer: true
        };
      }
    }
  } catch (err) {
    console.warn('Central Rules API unreachable, falling back to local cache:', err.message);
  }

  // Fallback to localStorage or defaultConfig
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (cached) {
    try {
      return {
        rules: JSON.parse(cached),
        isSyncedWithServer: false
      };
    } catch (e) {
      // ignore parse error
    }
  }

  return {
    rules: defaultConfig,
    isSyncedWithServer: false
  };
}

/**
 * Saves updated rules to central backend server and local cache.
 */
export async function saveCentralRules(rulesConfig) {
  // Always update local cache
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rulesConfig));

  try {
    const response = await fetch(RULES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rulesConfig)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.rules) {
        return {
          success: true,
          rules: data.rules,
          isSyncedWithServer: true
        };
      }
    }
  } catch (err) {
    console.warn('Could not sync rules to central server:', err.message);
  }

  return {
    success: true,
    rules: rulesConfig,
    isSyncedWithServer: false
  };
}
