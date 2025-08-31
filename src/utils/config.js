// Environment configuration
const config = {
  development: {
    apiBaseUrl: "http://localhost:5253/api",
    timeout: 50000,
    enableDebugLogs: true,
  },
  production: {
    apiBaseUrl: "https://192.168.10.32:4444/api",
    timeout: 50000,
    enableDebugLogs: false,
  },
};

// Get current environment
const environment = import.meta.env.MODE || "development";

// Export current environment config
export const currentConfig = config[environment] || config.development;

// Export environment info
export const isDevelopment = environment === "development";
export const isProduction = environment === "production";

// Helper function for conditional logging
export const debugLog = (...args) => {
  if (currentConfig.enableDebugLogs) {
    console.log(...args);
  }
};

export const debugError = (...args) => {
  if (currentConfig.enableDebugLogs) {
    console.error(...args);
  }
};
