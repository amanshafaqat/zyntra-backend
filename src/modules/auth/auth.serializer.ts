import type { Profile } from "@prisma/client";
import { env } from "@/config/env";
import type { UserWithProfile } from "@/modules/auth/auth.repository";

/** Shapes below mirror src/types/index.ts in the frontend exactly. */

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  verified: boolean;
  createdAt: string;
  avatarUrl: string | null;
}

export interface ProfileDto {
  degree: string;
  institution: string;
  cgpa: string;
  graduationYear: string;
  ielts: string;
  toefl: string;
  pte: string;
  gre: string;
  gmat: string;
  experience: string;
  projects: string[];
  certifications: string[];
  research: string;
  achievements: string;
  extracurriculars: string;
  leadership: string;
  budgetPKR: string;
  preferredCountries: string[];
  preferredPrograms: string[];
  careerGoals: string;
}

export function toUserDto(user: UserWithProfile): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt.toISOString(),
    avatarUrl: user.avatarUrl ? `${env.PUBLIC_URL}${user.avatarUrl}` : null,
  };
}

export function toProfileDto(profile: Profile): ProfileDto {
  return {
    degree: profile.degree,
    institution: profile.institution,
    cgpa: profile.cgpa,
    graduationYear: profile.graduationYear,
    ielts: profile.ielts,
    toefl: profile.toefl,
    pte: profile.pte,
    gre: profile.gre,
    gmat: profile.gmat,
    experience: profile.experience,
    projects: profile.projects,
    certifications: profile.certifications,
    research: profile.research,
    achievements: profile.achievements,
    extracurriculars: profile.extracurriculars,
    leadership: profile.leadership,
    budgetPKR: profile.budgetPKR,
    preferredCountries: profile.preferredCountries,
    preferredPrograms: profile.preferredPrograms,
    careerGoals: profile.careerGoals,
  };
}

export interface SessionDto {
  user: UserDto;
  profile: ProfileDto;
}

export function toSessionDto(user: UserWithProfile): SessionDto {
  if (!user.profile) throw new Error(`Data integrity: user ${user.id} has no profile row`);
  return { user: toUserDto(user), profile: toProfileDto(user.profile) };
}
