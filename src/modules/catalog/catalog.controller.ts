import { asyncHandler } from "@/utils/async-handler";
import { catalogService } from "./catalog.service";
import type { ProgramFiltersDto, ScholarshipFiltersDto, UpcomingDeadlinesQuery } from "./catalog.dto";

export const catalogController = {
  options: asyncHandler(async (_req, res) => {
    res.json(await catalogService.listOptions());
  }),

  countries: asyncHandler(async (_req, res) => {
    res.json(await catalogService.listCountries());
  }),

  listPrograms: asyncHandler(async (req, res) => {
    const filters = req.query as unknown as ProgramFiltersDto;
    res.json(await catalogService.listPrograms(filters));
  }),

  getProgram: asyncHandler(async (req, res) => {
    res.json(await catalogService.getProgram(req.params.slug));
  }),

  getProgramRecommendation: asyncHandler(async (req, res) => {
    res.json(await catalogService.getProgramWithRecommendation(req.params.slug, req.user!.id));
  }),

  upcomingDeadlines: asyncHandler(async (req, res) => {
    const query = req.query as unknown as UpcomingDeadlinesQuery;
    res.json(await catalogService.upcomingDeadlines(query));
  }),

  scholarships: asyncHandler(async (req, res) => {
    const { country } = req.query as unknown as ScholarshipFiltersDto;
    res.json(await catalogService.listScholarships(country));
  }),

  recommendations: asyncHandler(async (req, res) => {
    res.json(await catalogService.listRecommendations(req.user!.id));
  }),

  listSaved: asyncHandler(async (req, res) => {
    res.json(await catalogService.listSaved(req.user!.id));
  }),

  toggleSaved: asyncHandler(async (req, res) => {
    res.json(await catalogService.toggleSaved(req.user!.id, req.body.programId));
  }),
};
