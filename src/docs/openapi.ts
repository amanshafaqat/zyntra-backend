import { env } from "@/config/env";

const bearerAuth = [{ bearerAuth: [] }];

const messageResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Message" } } },
});

const sessionResponse = {
  description: "Authenticated session",
  content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Zyntra API",
    version: "1.0.0",
    description:
      "Zyntra API — authentication, sessions, users, profile (Part 1) plus catalog, recommendations, applications, documents, notifications, SOP and admin (Part 2). Responses mirror the frontend's TypeScript types exactly. Errors always return `{ message, errors? }`.",
  },
  servers: [{ url: `${env.PUBLIC_URL}${env.API_PREFIX}` }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Profile" },
    { name: "Catalog" },
    { name: "Recommendations" },
    { name: "Applications" },
    { name: "Documents" },
    { name: "Notifications" },
    { name: "SOP" },
    { name: "AI" },
    { name: "Predictions" },
    { name: "Extension" },
    { name: "Sync" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Message: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          errors: { type: "object", additionalProperties: { type: "string" }, nullable: true },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
          verified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          avatarUrl: { type: "string", nullable: true },
        },
      },
      Profile: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          cgpa: { type: "string" },
          graduationYear: { type: "string" },
          ielts: { type: "string" },
          toefl: { type: "string" },
          pte: { type: "string" },
          gre: { type: "string" },
          gmat: { type: "string" },
          experience: { type: "string" },
          projects: { type: "array", items: { type: "string" } },
          certifications: { type: "array", items: { type: "string" } },
          research: { type: "string" },
          achievements: { type: "string" },
          extracurriculars: { type: "string" },
          leadership: { type: "string" },
          budgetPKR: { type: "string" },
          preferredCountries: { type: "array", items: { type: "string" } },
          preferredPrograms: { type: "array", items: { type: "string" } },
          careerGoals: { type: "string" },
        },
      },
      Session: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          profile: { $ref: "#/components/schemas/Profile" },
        },
      },
      AuthResponse: {
        allOf: [
          { $ref: "#/components/schemas/Session" },
          { type: "object", properties: { accessToken: { type: "string" } } },
        ],
      },
      StrengthFactor: {
        type: "object",
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          weight: { type: "number" },
          score: { type: "number" },
          tip: { type: "string" },
        },
      },
      StrengthReport: {
        type: "object",
        properties: {
          overall: { type: "number" },
          factors: { type: "array", items: { $ref: "#/components/schemas/StrengthFactor" } },
          weakest: { $ref: "#/components/schemas/StrengthFactor" },
          completion: { type: "number" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness and dependency status",
        responses: {
          "200": {
            description: "Service healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    database: { type: "string" },
                    cache: { type: "string" },
                    uptimeSeconds: { type: "number" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "503": { description: "Database unreachable" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register and email a 6-digit verification code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created; verification pending",
            content: {
              "application/json": {
                schema: { type: "object", properties: { email: { type: "string" } } },
              },
            },
          },
          "409": messageResponse("Email already registered"),
          "422": messageResponse("Validation failed"),
        },
      },
    },
    "/auth/verify": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with the 6-digit code; returns a session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: { type: "string", format: "email" },
                  code: { type: "string", pattern: "^\\d{6}$" },
                },
              },
            },
          },
        },
        responses: { "200": sessionResponse, "400": messageResponse("Code invalid or expired") },
      },
    },
    "/auth/resend-code": {
      post: {
        tags: ["Auth"],
        summary: "Re-send the verification code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } },
            },
          },
        },
        responses: { "200": messageResponse("Code sent"), "404": messageResponse("No such account") },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in; sets an httpOnly refresh cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": sessionResponse,
          "401": messageResponse("Wrong email or password"),
          "403": messageResponse("Email not verified"),
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate the refresh token (cookie or body) for a new access token",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { type: "object", properties: { refreshToken: { type: "string" } } },
            },
          },
        },
        responses: { "200": sessionResponse, "401": messageResponse("Refresh token invalid") },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke the refresh token and clear the cookie",
        responses: { "200": messageResponse("Signed out") },
      },
    },
    "/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Current user + profile",
        security: bearerAuth,
        responses: {
          "200": { description: "Session", content: { "application/json": { schema: { $ref: "#/components/schemas/Session" } } } },
          "401": messageResponse("Not authenticated"),
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Email a password-reset code (never reveals account existence)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["email"], properties: { email: { type: "string" } } },
            },
          },
        },
        responses: { "200": messageResponse("Reset code sent if the account exists") },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Set a new password with the emailed code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  code: { type: "string", pattern: "^\\d{6}$" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: { "200": messageResponse("Password updated"), "400": messageResponse("Code invalid") },
      },
    },
    "/auth/password": {
      patch: {
        tags: ["Auth"],
        summary: "Change password while signed in (revokes all sessions)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["current", "next"],
                properties: {
                  current: { type: "string" },
                  next: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: { "200": messageResponse("Password changed"), "400": messageResponse("Current password incorrect") },
      },
    },
    "/users/me": {
      patch: {
        tags: ["Users"],
        summary: "Update the signed-in user's name",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 2 } } },
            },
          },
        },
        responses: {
          "200": { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete the signed-in user's account (cascades all data)",
        security: bearerAuth,
        responses: { "200": messageResponse("Account deleted") },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users (admin only)",
        security: bearerAuth,
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                    users: { type: "array", items: { $ref: "#/components/schemas/User" } },
                  },
                },
              },
            },
          },
          "403": messageResponse("Admin role required"),
        },
      },
    },
    "/profile": {
      get: {
        tags: ["Profile"],
        summary: "Get the signed-in user's profile",
        security: bearerAuth,
        responses: {
          "200": { description: "Profile", content: { "application/json": { schema: { $ref: "#/components/schemas/Profile" } } } },
        },
      },
      put: {
        tags: ["Profile"],
        summary: "Replace the profile (full object, all fields validated)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Profile" } } },
        },
        responses: {
          "200": { description: "Updated profile", content: { "application/json": { schema: { $ref: "#/components/schemas/Profile" } } } },
          "422": messageResponse("Validation failed"),
        },
      },
    },
    "/profile/strength": {
      get: {
        tags: ["Profile"],
        summary: "9-factor readiness score + profile completion",
        security: bearerAuth,
        responses: {
          "200": { description: "Report", content: { "application/json": { schema: { $ref: "#/components/schemas/StrengthReport" } } } },
        },
      },
    },
    "/profile/avatar": {
      post: {
        tags: ["Profile"],
        summary: "Upload an avatar (JPG/PNG/WebP, field name 'avatar')",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { avatar: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "New avatar URL",
            content: {
              "application/json": {
                schema: { type: "object", properties: { avatarUrl: { type: "string" } } },
              },
            },
          },
          "400": messageResponse("Invalid file"),
        },
      },
    },

    // ── Catalog ────────────────────────────────────────────────────────────
    "/catalog/countries": {
      get: { tags: ["Catalog"], summary: "All countries with nested universities and fee ranges", responses: { "200": { description: "Countries" } } },
    },
    "/catalog/programs": {
      get: {
        tags: ["Catalog"],
        summary: "Search and filter the 125 program entries (paginated)",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "country", in: "query", schema: { type: "string" } },
          { name: "program", in: "query", schema: { type: "string" } },
          { name: "maxFeePKR", in: "query", schema: { type: "integer" } },
          { name: "minRanking", in: "query", schema: { type: "integer" } },
          { name: "maxIelts", in: "query", schema: { type: "number" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 50 } },
        ],
        responses: { "200": { description: "Paginated programs" } },
      },
    },
    "/catalog/programs/upcoming-deadlines": {
      get: {
        tags: ["Catalog"],
        summary: "Programs whose admission deadline is approaching",
        parameters: [
          { name: "withinDays", in: "query", schema: { type: "integer", default: 120 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { "200": { description: "Programs sorted by soonest deadline" } },
      },
    },
    "/catalog/programs/{slug}": {
      get: { tags: ["Catalog"], summary: "Single program by stable slug", parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Program" }, "404": messageResponse("Not found") } },
    },
    "/catalog/programs/{slug}/recommendation": {
      get: { tags: ["Recommendations"], summary: "One program scored against the signed-in user (match, probability, gaps)", security: bearerAuth, parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Recommendation" } } },
    },
    "/catalog/recommendations": {
      get: { tags: ["Recommendations"], summary: "All 125 programs scored and ranked for the signed-in user", security: bearerAuth, responses: { "200": { description: "Ranked recommendations" } } },
    },
    "/catalog/scholarships": {
      get: { tags: ["Catalog"], summary: "Scholarships, optionally filtered by country", parameters: [{ name: "country", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Scholarships" } } },
    },
    "/catalog/saved": {
      get: { tags: ["Catalog"], summary: "Saved program slugs for the signed-in user", security: bearerAuth, responses: { "200": { description: "Array of program slugs" } } },
    },
    "/catalog/saved/toggle": {
      post: { tags: ["Catalog"], summary: "Bookmark or un-bookmark a program", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["programId"], properties: { programId: { type: "string" } } } } } }, responses: { "200": { description: "Updated saved slugs" } } },
    },

    // ── Applications ─────────────────────────────────────────────────────────
    "/applications": {
      get: { tags: ["Applications"], summary: "List the user's tracked applications (timeline-ordered)", security: bearerAuth, responses: { "200": { description: "Applications" } } },
      post: { tags: ["Applications"], summary: "Start tracking a program", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["programId"], properties: { programId: { type: "string" }, status: { type: "string" } } } } } }, responses: { "201": { description: "Created" }, "409": messageResponse("Already tracked") } },
    },
    "/applications/{id}": {
      get: { tags: ["Applications"], summary: "Single application", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Application" } } },
      delete: { tags: ["Applications"], summary: "Stop tracking an application", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Removed") } },
    },
    "/applications/{id}/status": {
      patch: { tags: ["Applications"], summary: "Update application status (notifies the user)", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string" } } } } } }, responses: { "200": { description: "Updated" } } },
    },
    "/applications/{id}/notes": {
      post: { tags: ["Applications"], summary: "Add a note", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } }, responses: { "201": { description: "Application with note" } } },
    },
    "/applications/{id}/notes/{noteId}": {
      delete: { tags: ["Applications"], summary: "Delete a note", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "noteId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Application without the note" } } },
    },

    // ── Documents ────────────────────────────────────────────────────────────
    "/documents": {
      get: { tags: ["Documents"], summary: "List the user's vault documents", security: bearerAuth, responses: { "200": { description: "Documents" } } },
      post: { tags: ["Documents"], summary: "Upload a document (field 'file', max 10 MB)", security: bearerAuth, requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" }, type: { type: "string" }, expiryDate: { type: "string" } } } } } }, responses: { "201": { description: "Document" }, "400": messageResponse("Invalid file") } },
    },
    "/documents/{id}": {
      put: { tags: ["Documents"], summary: "Replace a document's file", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } } }, responses: { "200": { description: "Updated document" } } },
      delete: { tags: ["Documents"], summary: "Delete a document", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/documents/{id}/download": {
      get: { tags: ["Documents"], summary: "Download / preview the original file", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Binary file stream" } } },
    },

    // ── Notifications ────────────────────────────────────────────────────────
    "/notifications": {
      get: { tags: ["Notifications"], summary: "List notifications (newest first)", security: bearerAuth, responses: { "200": { description: "Notifications" } } },
    },
    "/notifications/read-all": {
      post: { tags: ["Notifications"], summary: "Mark all as read", security: bearerAuth, responses: { "200": messageResponse("All read") } },
    },
    "/notifications/{id}/read": {
      post: { tags: ["Notifications"], summary: "Mark one as read", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Read") } },
    },

    // ── SOP ──────────────────────────────────────────────────────────────────
    "/sop": {
      get: { tags: ["SOP"], summary: "List the user's SOP drafts", security: bearerAuth, responses: { "200": { description: "Drafts" } } },
    },
    "/sop/generate": {
      post: { tags: ["SOP"], summary: "Generate a draft from the profile + a university/program", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["university", "program"], properties: { university: { type: "string" }, program: { type: "string" }, highlights: { type: "string" } } } } } }, responses: { "201": { description: "Draft" } } },
    },
    "/sop/{id}": {
      get: { tags: ["SOP"], summary: "Get a draft", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Draft" } } },
      put: { tags: ["SOP"], summary: "Save edited content", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" } } } } } }, responses: { "200": { description: "Draft" } } },
      delete: { tags: ["SOP"], summary: "Delete a draft", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },

    // ── AI ───────────────────────────────────────────────────────────────────
    "/ai/status": {
      get: { tags: ["AI"], summary: "Whether AI is Claude-backed or template mode", security: bearerAuth, responses: { "200": { description: "AI mode" } } },
    },
    "/ai/recommendation-explanation": {
      post: { tags: ["AI"], summary: "Natural-language explanation of a recommendation", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["programId"], properties: { programId: { type: "string" } } } } } }, responses: { "200": { description: "Explanation + scores" } } },
    },
    "/ai/gap-analysis": {
      post: { tags: ["AI"], summary: "Actionable advice for a program's requirement gaps", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["programId"], properties: { programId: { type: "string" } } } } } }, responses: { "200": { description: "Gaps + advice" } } },
    },
    "/ai/sop/generate": {
      post: { tags: ["AI"], summary: "AI-generated SOP (Claude, template fallback)", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["university", "program"], properties: { university: { type: "string" }, program: { type: "string" }, highlights: { type: "string" } } } } } }, responses: { "200": { description: "SOP content" } } },
    },
    "/ai/sop/improve": {
      post: { tags: ["AI"], summary: "Improve an existing SOP draft", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" }, instruction: { type: "string" }, university: { type: "string" }, program: { type: "string" } } } } } }, responses: { "200": { description: "Improved content" } } },
    },
    "/ai/career-guidance": {
      post: { tags: ["AI"], summary: "Personalised career guidance", security: bearerAuth, requestBody: { required: false, content: { "application/json": { schema: { type: "object", properties: { question: { type: "string" } } } } } }, responses: { "200": { description: "Guidance" } } },
    },

    // ── Predictions (ML) ─────────────────────────────────────────────────────
    "/predictions/status": {
      get: { tags: ["Predictions"], summary: "Whether the FastAPI ML service is wired up", security: bearerAuth, responses: { "200": { description: "ML status" } } },
    },
    "/predictions/admission": {
      post: { tags: ["Predictions"], summary: "Admission-success probability for a program", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["programId"], properties: { programId: { type: "string" } } } } } }, responses: { "200": { description: "Probability + confidence + source" } } },
    },
    "/predictions/match": {
      get: { tags: ["Predictions"], summary: "University matching ranked by ML-refined probability", security: bearerAuth, parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 10 } }, { name: "country", in: "query", schema: { type: "string" } }], responses: { "200": { description: "Ranked matches" } } },
    },

    // ── Browser extension ────────────────────────────────────────────────────
    "/extension/auth/login": {
      post: { tags: ["Extension"], summary: "Extension login → short-lived extension token", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string" }, password: { type: "string" } } } } } }, responses: { "200": { description: "token + user" }, "401": messageResponse("Bad credentials") } },
    },
    "/extension/auth/logout": {
      post: { tags: ["Extension"], summary: "Extension logout (client discards token)", responses: { "200": messageResponse("Signed out") } },
    },
    "/extension/session": {
      get: { tags: ["Extension"], summary: "Popup session: user, completion, autofill readiness", responses: { "200": { description: "Session" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },
    "/extension/profile": {
      get: { tags: ["Extension"], summary: "Compact profile summary for the popup", responses: { "200": { description: "Profile summary" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },
    "/extension/autofill": {
      get: { tags: ["Extension"], summary: "Field map for autofilling application portals", responses: { "200": { description: "Autofill fields + ready count" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },
    "/extension/saved-universities": {
      get: { tags: ["Extension"], summary: "Saved universities for the popup", responses: { "200": { description: "Saved universities" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },
    "/extension/saved-applications": {
      get: { tags: ["Extension"], summary: "Tracked applications for the popup", responses: { "200": { description: "Applications" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },
    "/extension/sync": {
      get: { tags: ["Extension"], summary: "One-shot hydration of the whole popup", responses: { "200": { description: "Full extension state" } }, parameters: [{ name: "X-Extension-Token", in: "header", required: true, schema: { type: "string" } }] },
    },

    // ── Sync & push ──────────────────────────────────────────────────────────
    "/sync/pull": {
      get: { tags: ["Sync"], summary: "Pull latest notifications + unread count", security: bearerAuth, responses: { "200": { description: "Notifications" } } },
    },
    "/sync/upcoming-deadlines": {
      get: { tags: ["Sync"], summary: "Upcoming admission deadline service", security: bearerAuth, parameters: [{ name: "withinDays", in: "query", schema: { type: "integer", default: 120 } }, { name: "limit", in: "query", schema: { type: "integer", default: 20 } }], responses: { "200": { description: "Programs by soonest deadline" } } },
    },
    "/sync/push/subscribe": {
      post: { tags: ["Sync"], summary: "Register a web-push subscription", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["endpoint"], properties: { endpoint: { type: "string" }, keys: { type: "object", properties: { p256dh: { type: "string" }, auth: { type: "string" } } }, userAgent: { type: "string" } } } } } }, responses: { "201": messageResponse("Registered") } },
    },
    "/sync/push/unsubscribe": {
      post: { tags: ["Sync"], summary: "Remove a push subscription", security: bearerAuth, requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["endpoint"], properties: { endpoint: { type: "string" } } } } } }, responses: { "200": messageResponse("Removed") } },
    },
    "/sync/run-reminders": {
      post: { tags: ["Sync"], summary: "Manually trigger the deadline reminder sweep (admin)", security: bearerAuth, responses: { "200": { description: "created + emailed counts" } } },
    },

    // ── Admin ────────────────────────────────────────────────────────────────
    "/admin/users": {
      get: { tags: ["Admin"], summary: "List all users (paginated, searchable)", security: bearerAuth, responses: { "200": { description: "Users" }, "403": messageResponse("Admin only") } },
    },
    "/admin/users/{id}/status": {
      patch: { tags: ["Admin"], summary: "Suspend or reactivate a user", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["active", "suspended"] } } } } } }, responses: { "200": { description: "Updated user" } } },
    },
    "/admin/users/{id}": {
      delete: { tags: ["Admin"], summary: "Delete a user", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/admin/universities": {
      post: { tags: ["Admin"], summary: "Create a university", security: bearerAuth, responses: { "201": { description: "University" } } },
    },
    "/admin/universities/{id}": {
      put: { tags: ["Admin"], summary: "Update a university", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "University" } } },
      delete: { tags: ["Admin"], summary: "Delete a university (cascades programs)", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/admin/programs": {
      post: { tags: ["Admin"], summary: "Create a program", security: bearerAuth, responses: { "201": { description: "Program" } } },
    },
    "/admin/programs/{id}": {
      put: { tags: ["Admin"], summary: "Update a program (fee, deadline, intake)", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Program" } } },
      delete: { tags: ["Admin"], summary: "Delete a program", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/admin/scholarships": {
      post: { tags: ["Admin"], summary: "Create a scholarship", security: bearerAuth, responses: { "201": { description: "Scholarship" } } },
    },
    "/admin/scholarships/{id}": {
      put: { tags: ["Admin"], summary: "Update a scholarship", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Scholarship" } } },
      delete: { tags: ["Admin"], summary: "Delete a scholarship", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/admin/applications": {
      get: { tags: ["Admin"], summary: "List every application across users", security: bearerAuth, responses: { "200": { description: "Applications" } } },
    },
    "/admin/applications/{id}/status": {
      patch: { tags: ["Admin"], summary: "Override an application's status", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Application" } } },
    },
    "/admin/applications/{id}": {
      delete: { tags: ["Admin"], summary: "Delete any application", security: bearerAuth, parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": messageResponse("Deleted") } },
    },
    "/admin/analytics": {
      get: { tags: ["Admin"], summary: "Dashboard statistics: totals, applications by status/country, signups by month", security: bearerAuth, responses: { "200": { description: "Analytics" } } },
    },
  },
} as const;
