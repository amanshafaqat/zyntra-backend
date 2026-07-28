import { ApiError } from "@/utils/api-error";
import { mailer } from "@/lib/mailer";
import { catalogRepository } from "@/modules/catalog/catalog.repository";
import {
  statusToDb,
  toApplicationDto,
  type ApplicationDto,
} from "@/modules/catalog/catalog.serializer";
import { notificationService } from "@/modules/notifications/notifications.service";
import { applicationsRepository } from "./applications.repository";
import type { CreateApplicationDto, NoteDto, UpdateStatusDto } from "./applications.dto";

const REMINDER_THRESHOLDS = [30, 7, 1] as const;
const daysUntil = (iso: Date): number =>
  Math.ceil((iso.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

async function ownedApplication(userId: string, id: string) {
  const row = await applicationsRepository.findById(userId, id);
  if (!row) throw ApiError.notFound("Application not found.");
  return row;
}

export const applicationsService = {
  async list(userId: string): Promise<ApplicationDto[]> {
    const rows = await applicationsRepository.listForUser(userId);
    return rows.map(toApplicationDto);
  },

  async get(userId: string, id: string): Promise<ApplicationDto> {
    return toApplicationDto(await ownedApplication(userId, id));
  },

  async create(userId: string, dto: CreateApplicationDto): Promise<ApplicationDto> {
    const program = await catalogRepository.findProgramBySlug(dto.programId);
    if (!program) throw ApiError.notFound("Program not found.");

    const existing = await applicationsRepository.findExisting(userId, program.id);
    if (existing) throw ApiError.conflict("You already track an application for this program.");

    const created = await applicationsRepository.create(userId, program.id, statusToDb(dto.status));
    return toApplicationDto(created);
  },

  async updateStatus(userId: string, id: string, dto: UpdateStatusDto): Promise<ApplicationDto> {
    const row = await ownedApplication(userId, id);
    const updated = await applicationsRepository.updateStatus(row.id, statusToDb(dto.status));
    await notificationService.push(
      userId,
      "status",
      `${row.program.university.name} — ${row.program.name} moved to “${dto.status}”.`,
      "/applications",
    );
    return toApplicationDto(updated);
  },

  async remove(userId: string, id: string): Promise<void> {
    const row = await ownedApplication(userId, id);
    await applicationsRepository.delete(row.id);
  },

  async addNote(userId: string, id: string, dto: NoteDto): Promise<ApplicationDto> {
    const row = await ownedApplication(userId, id);
    await applicationsRepository.addNote(row.id, dto.text);
    return toApplicationDto(await ownedApplication(userId, id));
  },

  async removeNote(userId: string, applicationId: string, noteId: string): Promise<ApplicationDto> {
    const row = await ownedApplication(userId, applicationId);
    const note = row.notes.find((n) => n.id === noteId);
    if (!note) throw ApiError.notFound("Note not found.");
    await applicationsRepository.deleteNote(noteId);
    return toApplicationDto(await ownedApplication(userId, applicationId));
  },

  /**
   * Mirrors the documented policy: reminders fire at 30, 7 and 1 days before
   * an application deadline, and each threshold only fires once per app.
   */
  async runDeadlineReminders(options: { sendEmail?: boolean } = {}): Promise<{ created: number; emailed: number }> {
    const apps = await applicationsRepository.findUsersWithDeadlinesWithin([...REMINDER_THRESHOLDS]);
    let created = 0;
    let emailed = 0;

    // Group freshly-fired reminders per user for a single email digest.
    const digests = new Map<
      string,
      { name: string; email: string; items: { university: string; program: string; deadline: string; daysLeft: number }[] }
    >();

    for (const app of apps) {
      const remaining = daysUntil(app.program.deadline);
      const already = new Set(app.reminders.map((r) => r.threshold));
      for (const threshold of REMINDER_THRESHOLDS) {
        if (remaining <= threshold && remaining >= 0 && !already.has(threshold)) {
          await notificationService.push(
            app.user.id,
            "deadline",
            `${app.program.university.name} — ${app.program.name} deadline in ${remaining === 0 ? "less than a day" : `${remaining} day${remaining === 1 ? "" : "s"}`}.`,
            "/applications",
          );
          await applicationsRepository.recordReminder(app.id, threshold);
          created += 1;

          const digest = digests.get(app.user.id) ?? { name: app.user.name, email: app.user.email, items: [] };
          digest.items.push({
            university: app.program.university.name,
            program: app.program.name,
            deadline: app.program.deadline.toISOString().slice(0, 10),
            daysLeft: remaining,
          });
          digests.set(app.user.id, digest);
        }
      }
    }

    if (options.sendEmail) {
      for (const digest of digests.values()) {
        try {
          await mailer.sendDeadlineReminder(digest.email, digest.name, digest.items);
          emailed += 1;
        } catch {
          // Email failures never block in-app reminders.
        }
      }
    }

    return { created, emailed };
  },
};
