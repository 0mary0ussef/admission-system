// Environment configuration
const config = {
  development: {
    apiBaseUrl: "http://localhost:5253/api",
    timeout: 10000,
    enableDebugLogs: true,
  },
  production: {
    apiBaseUrl: "https://your-production-domain.com/api", // Update this with your actual production domain
    timeout: 15000,
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
