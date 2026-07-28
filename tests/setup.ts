/**
 * Loads a deterministic environment before any module imports `@/config/env`,
 * which validates and exits on missing variables. Integration tests point at
 * DATABASE_URL (set in CI / .env.test); unit tests never touch the database.
 */
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "4001";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-at-least-16-chars";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-at-least-16-chars";
process.env.DATABASE_URL ??= "postgresql://zyntra:zyntra@localhost:5432/zyntra_test?schema=public";
process.env.REDIS_URL ??= "";
process.env.SMTP_HOST ??= "";
process.env.PUBLIC_URL ??= "http://localhost:4001";
process.env.ANTHROPIC_API_KEY = "";
process.env.GROQ_API_KEY = "";
process.env.ML_SERVICE_URL ??= "";
process.env.BCRYPT_ROUNDS ??= "8"; // faster hashing in tests
