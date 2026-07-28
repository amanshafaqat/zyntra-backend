import type {
  Application,
  ApplicationNote,
  ApplicationStatus as PrismaAppStatus,
  Country,
  Document as DbDocument,
  Notification,
  Program,
  Scholarship,
  SopDraft,
  University,
} from "@prisma/client";
import { env } from "@/config/env";

/** Every shape here mirrors src/types/index.ts in the frontend exactly. */

export type UiApplicationStatus =
  | "Not Started" | "In Progress" | "Submitted" | "Decision Pending" | "Accepted" | "Rejected";

const STATUS_TO_UI: Record<PrismaAppStatus, UiApplicationStatus> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  DECISION_PENDING: "Decision Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const STATUS_TO_DB: Record<UiApplicationStatus, PrismaAppStatus> = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  Submitted: "SUBMITTED",
  "Decision Pending": "DECISION_PENDING",
  Accepted: "ACCEPTED",
  Rejected: "REJECTED",
};

export const statusToUi = (s: PrismaAppStatus): UiApplicationStatus => STATUS_TO_UI[s];
export const statusToDb = (s: UiApplicationStatus): PrismaAppStatus => STATUS_TO_DB[s];

// ─── Program / University ─────────────────────────────────────────────────────
export type ProgramWithLocation = Program & {
  university: University & { country: Country };
};

export interface ProgramEntryDto {
  id: string;
  university: string;
  city: string;
  country: string;
  flag: string;
  currency: string;
  pkrRate: number;
  program: string;
  degreeLevel?: string;
  degreeType?: string;
  studyField?: string;
  specialization?: string | null;
  campus?: string | null;
  studyMode?: string;
  language?: string;
  duration?: string;
  applicationMethod?: string;
  fee: number;
  feePKR: number;
  livingCostMonthly: number;
  ieltsMin: number;
  cgpaMin: number;
  ranking: number;
  deadline: string;
  description: string;
  portal: string;
  intakeLabel: string;
  eligibilitySummary?: string | null;
  minimumGpa?: number | null;
  englishRequirements?: string | null;
  officialProgramUrl?: string | null;
  officialApplicationUrl?: string | null;
  sourceUrl?: string | null;
  sourceTitle?: string | null;
  lastVerifiedAt?: string | null;
  verificationStatus: "VERIFIED" | "PARTIALLY_VERIFIED" | "SECONDARY_SOURCE" | "MODELED" | "UNVERIFIED" | "STALE" | "UNSUPPORTED";
  isActive?: boolean;
}

export function toProgramEntry(p: ProgramWithLocation): ProgramEntryDto {
  const country = p.university.country;
  return {
    id: p.slug,
    university: p.university.name,
    city: p.university.city,
    country: country.name,
    flag: country.flag,
    currency: country.currency,
    pkrRate: country.pkrRate,
    program: p.name,
    degreeLevel: p.degreeLevel,
    degreeType: p.degreeType,
    studyField: p.studyField,
    specialization: p.specialization,
    campus: p.campus,
    studyMode: p.studyMode,
    language: p.language,
    duration: p.duration,
    applicationMethod: p.applicationMethod,
    fee: p.fee,
    feePKR: p.fee * country.pkrRate,
    livingCostMonthly: country.livingCostMonthly,
    ieltsMin: p.university.ieltsMin,
    cgpaMin: p.university.cgpaMin,
    ranking: p.university.ranking,
    deadline: p.deadline.toISOString().slice(0, 10),
    description: p.university.description,
    portal: country.portal,
    intakeLabel: p.intakeLabel,
    eligibilitySummary: p.eligibilitySummary,
    minimumGpa: p.minimumGpa,
    englishRequirements: p.englishRequirements,
    officialProgramUrl: p.officialProgramUrl,
    officialApplicationUrl: p.officialApplicationUrl,
    sourceUrl: p.sourceUrl,
    sourceTitle: p.sourceTitle,
    lastVerifiedAt: p.lastVerifiedAt ? p.lastVerifiedAt.toISOString().slice(0, 10) : null,
    verificationStatus: p.verificationStatus as ProgramEntryDto["verificationStatus"],
    isActive: p.isActive,
  };
}

export interface UniversityDto {
  name: string;
  city: string;
  ranking: number;
  ieltsMin: number;
  cgpaMin: number;
  feeMin: number;
  feeMax: number;
  description: string;
}

export interface CountryDto {
  name: string;
  flag: string;
  currency: string;
  pkrRate: number;
  portal: string;
  livingCostMonthly: number;
  universities: UniversityDto[];
}

export function toCountryDto(
  country: Country & { universities: (University & { programs: Program[] })[] },
): CountryDto {
  return {
    name: country.name,
    flag: country.flag,
    currency: country.currency,
    pkrRate: country.pkrRate,
    portal: country.portal,
    livingCostMonthly: country.livingCostMonthly,
    universities: country.universities.map((u) => {
      const fees = u.programs.map((p) => p.fee);
      return {
        name: u.name,
        city: u.city,
        ranking: u.ranking,
        ieltsMin: u.ieltsMin,
        cgpaMin: u.cgpaMin,
        feeMin: fees.length ? Math.min(...fees) : 0,
        feeMax: fees.length ? Math.max(...fees) : 0,
        description: u.description,
      };
    }),
  };
}

// ─── Scholarships ─────────────────────────────────────────────────────────────
export interface ScholarshipDto {
  id: string;
  name: string;
  country: string;
  flag: string;
  amount: string;
  deadline: string;
  eligiblePrograms: string[];
  coverage: "Full" | "Partial";
  description: string;
}

export function toScholarshipDto(s: Scholarship): ScholarshipDto {
  return {
    id: s.id,
    name: s.name,
    country: s.country,
    flag: s.flag,
    amount: s.amount,
    deadline: s.deadline.toISOString().slice(0, 10),
    eligiblePrograms: s.eligiblePrograms,
    coverage: s.coverage as "Full" | "Partial",
    description: s.description,
  };
}

// ─── Applications ─────────────────────────────────────────────────────────────
export interface ApplicationNoteDto {
  id: string;
  text: string;
  createdAt: string;
}

export interface ApplicationDto {
  id: string;
  programId: string;
  university: string;
  program: string;
  country: string;
  flag: string;
  status: UiApplicationStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  notes: ApplicationNoteDto[];
}

export type ApplicationWithRelations = Application & {
  program: ProgramWithLocation;
  notes: ApplicationNote[];
};

export function toApplicationDto(a: ApplicationWithRelations): ApplicationDto {
  const country = a.program.university.country;
  return {
    id: a.id,
    programId: a.program.slug,
    university: a.program.university.name,
    program: a.program.name,
    country: country.name,
    flag: country.flag,
    status: statusToUi(a.status),
    deadline: a.program.deadline.toISOString().slice(0, 10),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    notes: a.notes.map((n) => ({ id: n.id, text: n.text, createdAt: n.createdAt.toISOString() })),
  };
}

// ─── Documents ────────────────────────────────────────────────────────────────
export interface DocumentDto {
  id: string;
  type: string;
  name: string;
  size: number;
  mime: string;
  uploadedAt: string;
  expiryDate?: string;
  /**
   * Replaces the frontend's demo-mode `dataUrl` (inline base64, capped at
   * 700 KB). This is an authenticated streaming endpoint with no size limit:
   * the vault page should use it as the `src` for image/PDF previews and as
   * the `href` for downloads. It requires the Bearer token, so previews must
   * fetch it as a blob rather than assigning the URL directly to `<img src>`.
   */
  downloadUrl: string;
}

export function toDocumentDto(d: DbDocument): DocumentDto {
  return {
    id: d.id,
    type: d.type,
    name: d.name,
    size: d.size,
    mime: d.mime,
    uploadedAt: d.uploadedAt.toISOString(),
    expiryDate: d.expiryDate ? d.expiryDate.toISOString().slice(0, 10) : undefined,
    downloadUrl: `${env.PUBLIC_URL}${env.API_PREFIX}/documents/${d.id}/download`,
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface NotificationDto {
  id: string;
  kind: "deadline" | "status" | "tip" | "scholarship" | "system";
  text: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export function toNotificationDto(n: Notification): NotificationDto {
  return {
    id: n.id,
    kind: n.kind,
    text: n.text,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
    href: n.href ?? undefined,
  };
}

// ─── SOP drafts ───────────────────────────────────────────────────────────────
export interface SopDraftDto {
  id: string;
  university: string;
  program: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function toSopDto(d: SopDraft): SopDraftDto {
  return {
    id: d.id,
    university: d.university,
    program: d.program,
    content: d.content,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}
