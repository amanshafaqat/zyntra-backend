import { z } from "zod";
import { statusToDb, type UiApplicationStatus } from "@/modules/catalog/catalog.serializer";

const UI_STATUSES: [UiApplicationStatus, ...UiApplicationStatus[]] = [
  "Not Started", "In Progress", "Submitted", "Decision Pending", "Accepted", "Rejected",
];

const uiStatus = z.enum(UI_STATUSES);

export const createApplicationSchema = z.object({
  programId: z.string().min(1, "programId is required"),
  status: uiStatus.default("Not Started"),
});
export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;

export const updateStatusSchema = z.object({
  status: uiStatus,
});
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

export const noteSchema = z.object({
  text: z.string().trim().min(2, "Note must be at least 2 characters").max(500, "Notes are capped at 500 characters"),
});
export type NoteDto = z.infer<typeof noteSchema>;

export const applicationIdParam = z.object({ id: z.string().min(1) });
export const applicationNoteParam = z.object({ id: z.string().min(1), noteId: z.string().min(1) });

/** Re-exported so services can compile-check status casts. */
export const asDbStatus = statusToDb;
