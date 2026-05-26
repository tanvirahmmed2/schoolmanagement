// Consolidated environment variables and secrets

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || "3000";

// PostgreSQL Config
const pgUser = process.env.PG_USER;
const pgPassword = process.env.PG_PASSWORD;
const pgHost = process.env.PG_HOST;
const pgPort = process.env.PG_PORT || "5432";
const pgDb = process.env.PG_DB || "postgres";

export const DATABASE_URL = pgUser && pgPassword && pgHost
  ? `postgresql://${encodeURIComponent(pgUser)}:${encodeURIComponent(pgPassword)}@${pgHost}:${pgPort}/${pgDb}`
  : process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/edusaas";

// JWT Settings
export const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m";
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

// Bcrypt
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

// App URLs
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Cookie settings
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
export const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || "lax";

// SMTP settings
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@edusaas.app";
export const BREVO_API_KEY = process.env.BREVO_API_KEY || "";

// SMS settings
export const SMS_API_KEY = process.env.SMS_API_KEY || "";
export const SMS_SENDER = process.env.SMS_SENDER || "EduSaaS";

export const env = {
  NODE_ENV,
  PORT: parseInt(PORT, 10) || 3000,
  DATABASE_URL,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
  BCRYPT_ROUNDS,
  APP_URL: NEXT_PUBLIC_APP_URL,
  COOKIE_SECURE,
  COOKIE_SAME_SITE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  FROM_EMAIL,
  BREVO_API_KEY,
  SMS_API_KEY,
  SMS_SENDER,
};

export default env;
