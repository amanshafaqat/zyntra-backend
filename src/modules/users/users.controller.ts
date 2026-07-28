import { asyncHandler } from "@/utils/async-handler";
import { authService } from "@/modules/auth/auth.service";
import { toUserDto } from "@/modules/auth/auth.serializer";
import { usersRepository } from "./users.repository";
import type { ListUsersQuery } from "./users.dto";

export const usersController = {
  /** PATCH /users/me — matches frontend authService.updateName(name). */
  updateMe: asyncHandler(async (req, res) => {
    const user = await authService.updateName(req.user!.id, req.body.name);
    res.json(user);
  }),

  /** DELETE /users/me — matches frontend authService.deleteAccount(). */
  deleteMe: asyncHandler(async (req, res) => {
    await authService.deleteAccount(req.user!.id);
    res.json({ message: "Account deleted." });
  }),

  /** GET /users — admin only (role-based access demonstration for Part 1). */
  list: asyncHandler(async (req, res) => {
    const query = req.query as unknown as ListUsersQuery;
    const { total, users } = await usersRepository.list(query);
    res.json({
      total,
      page: query.page,
      pageSize: query.pageSize,
      users: users.map(toUserDto),
    });
  }),
};
