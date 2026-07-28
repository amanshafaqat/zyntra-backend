import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { catalogController } from "./catalog.controller";
import {
  programFiltersSchema,
  scholarshipFiltersSchema,
  toggleSavedSchema,
  upcomingDeadlinesQuerySchema,
} from "./catalog.dto";

export const catalogRouter = Router();

// Public catalog
catalogRouter.get("/options", catalogController.options);
catalogRouter.get("/countries", catalogController.countries);
catalogRouter.get("/programs", validate({ query: programFiltersSchema }), catalogController.listPrograms);
catalogRouter.get("/programs/upcoming-deadlines", validate({ query: upcomingDeadlinesQuerySchema }), catalogController.upcomingDeadlines);
catalogRouter.get("/programs/:slug", catalogController.getProgram);
catalogRouter.get("/scholarships", validate({ query: scholarshipFiltersSchema }), catalogController.scholarships);

// Personalised: matching, recommendations, saved
catalogRouter.get("/programs/:slug/recommendation", requireAuth, catalogController.getProgramRecommendation);
catalogRouter.get("/recommendations", requireAuth, catalogController.recommendations);
catalogRouter.get("/saved", requireAuth, catalogController.listSaved);
catalogRouter.post("/saved/toggle", requireAuth, validate({ body: toggleSavedSchema }), catalogController.toggleSaved);
