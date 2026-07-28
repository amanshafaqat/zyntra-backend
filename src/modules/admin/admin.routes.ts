import { Router } from "express";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { auditService } from "@/modules/audit/audit.service";
import { adminService } from "./admin.service";
import {
  adminAppStatusSchema,
  adminListQuerySchema,
  adminUserStatusSchema,
  idParam,
  programBodySchema,
  programUpdateSchema,
  scholarshipBodySchema,
  universityBodySchema,
} from "./admin.dto";

const adminController = {
  // Users
  listUsers: asyncHandler(async (req, res) => {
    res.json(await adminService.listUsers(req.query as never));
  }),
  setUserStatus: asyncHandler(async (req, res) => {
    const result = await adminService.setUserStatus(req.params.id, req.body);
    auditService.record({
      actorId: req.user!.id,
      action: "STATUS_CHANGE",
      entity: "user",
      entityId: req.params.id,
      summary: `User status set to ${req.body.status}`,
      ip: req.ip,
    });
    res.json(result);
  }),
  deleteUser: asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id);
    auditService.record({
      actorId: req.user!.id,
      action: "DELETE",
      entity: "user",
      entityId: req.params.id,
      summary: "User deleted by admin",
      ip: req.ip,
    });
    res.json({ message: "User deleted." });
  }),

  // Universities
  createUniversity: asyncHandler(async (req, res) => {
    const result = await adminService.createUniversity(req.body);
    auditService.record({ actorId: req.user!.id, action: "CREATE", entity: "university", entityId: result.id, summary: `Created university ${result.name}`, ip: req.ip });
    res.status(201).json(result);
  }),
  updateUniversity: asyncHandler(async (req, res) => {
    const result = await adminService.updateUniversity(req.params.id, req.body);
    auditService.record({ actorId: req.user!.id, action: "UPDATE", entity: "university", entityId: req.params.id, summary: `Updated university ${result.name}`, ip: req.ip });
    res.json(result);
  }),
  deleteUniversity: asyncHandler(async (req, res) => {
    await adminService.deleteUniversity(req.params.id);
    auditService.record({ actorId: req.user!.id, action: "DELETE", entity: "university", entityId: req.params.id, summary: "Deleted university", ip: req.ip });
    res.json({ message: "University deleted." });
  }),

  // Programs
  createProgram: asyncHandler(async (req, res) => {
    const result = await adminService.createProgram(req.body);
    auditService.record({ actorId: req.user!.id, action: "CREATE", entity: "program", entityId: result.id, summary: `Created program ${result.program} @ ${result.university}`, ip: req.ip });
    res.status(201).json(result);
  }),
  updateProgram: asyncHandler(async (req, res) => {
    const result = await adminService.updateProgram(req.params.id, req.body);
    auditService.record({ actorId: req.user!.id, action: "UPDATE", entity: "program", entityId: req.params.id, summary: `Updated program ${result.program}`, ip: req.ip });
    res.json(result);
  }),
  deleteProgram: asyncHandler(async (req, res) => {
    await adminService.deleteProgram(req.params.id);
    auditService.record({ actorId: req.user!.id, action: "DELETE", entity: "program", entityId: req.params.id, summary: "Deleted program", ip: req.ip });
    res.json({ message: "Program deleted." });
  }),

  // Scholarships
  createScholarship: asyncHandler(async (req, res) => {
    const result = await adminService.createScholarship(req.body);
    auditService.record({ actorId: req.user!.id, action: "CREATE", entity: "scholarship", entityId: result.id, summary: `Created scholarship ${result.name}`, ip: req.ip });
    res.status(201).json(result);
  }),
  updateScholarship: asyncHandler(async (req, res) => {
    const result = await adminService.updateScholarship(req.params.id, req.body);
    auditService.record({ actorId: req.user!.id, action: "UPDATE", entity: "scholarship", entityId: req.params.id, summary: `Updated scholarship ${result.name}`, ip: req.ip });
    res.json(result);
  }),
  deleteScholarship: asyncHandler(async (req, res) => {
    await adminService.deleteScholarship(req.params.id);
    auditService.record({ actorId: req.user!.id, action: "DELETE", entity: "scholarship", entityId: req.params.id, summary: "Deleted scholarship", ip: req.ip });
    res.json({ message: "Scholarship deleted." });
  }),

  // Applications
  listApplications: asyncHandler(async (req, res) => {
    res.json(await adminService.listApplications(req.query as never));
  }),
  setApplicationStatus: asyncHandler(async (req, res) => {
    res.json(await adminService.setApplicationStatus(req.params.id, req.body));
  }),
  deleteApplication: asyncHandler(async (req, res) => {
    await adminService.deleteApplication(req.params.id);
    res.json({ message: "Application deleted." });
  }),

  // Analytics
  analytics: asyncHandler(async (_req, res) => {
    res.json(await adminService.analytics());
  }),
};

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

// Users
adminRouter.get("/users", validate({ query: adminListQuerySchema }), adminController.listUsers);
adminRouter.patch("/users/:id/status", validate({ params: idParam, body: adminUserStatusSchema }), adminController.setUserStatus);
adminRouter.delete("/users/:id", validate({ params: idParam }), adminController.deleteUser);

// Universities
adminRouter.post("/universities", validate({ body: universityBodySchema }), adminController.createUniversity);
adminRouter.put("/universities/:id", validate({ params: idParam, body: universityBodySchema }), adminController.updateUniversity);
adminRouter.delete("/universities/:id", validate({ params: idParam }), adminController.deleteUniversity);

// Programs
adminRouter.post("/programs", validate({ body: programBodySchema }), adminController.createProgram);
adminRouter.put("/programs/:id", validate({ params: idParam, body: programUpdateSchema }), adminController.updateProgram);
adminRouter.patch("/programs/:id", validate({ params: idParam, body: programUpdateSchema }), adminController.updateProgram);
adminRouter.delete("/programs/:id", validate({ params: idParam }), adminController.deleteProgram);

// Scholarships
adminRouter.post("/scholarships", validate({ body: scholarshipBodySchema }), adminController.createScholarship);
adminRouter.put("/scholarships/:id", validate({ params: idParam, body: scholarshipBodySchema }), adminController.updateScholarship);
adminRouter.delete("/scholarships/:id", validate({ params: idParam }), adminController.deleteScholarship);

// Applications
adminRouter.get("/applications", validate({ query: adminListQuerySchema }), adminController.listApplications);
adminRouter.patch("/applications/:id/status", validate({ params: idParam, body: adminAppStatusSchema }), adminController.setApplicationStatus);
adminRouter.delete("/applications/:id", validate({ params: idParam }), adminController.deleteApplication);

// Analytics
adminRouter.get("/analytics", adminController.analytics);
