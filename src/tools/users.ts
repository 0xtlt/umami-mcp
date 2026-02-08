import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerUserTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_get_user",
		"Get user details by ID (admin only, self-hosted)",
		{ userId: schemas.userId },
		async ({ userId }) => {
			return wrap(async () => client.getUser(userId));
		},
	);

	server.tool(
		"umami_get_user_websites",
		"Get all websites belonging to a user",
		{
			userId: schemas.userId,
			includeTeams: z.boolean().optional().describe("Include team websites"),
			search: schemas.search,
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ userId, includeTeams, search, page, pageSize }) => {
			return wrap(async () =>
				client.getUserWebsites(userId, { includeTeams, search, page, pageSize }),
			);
		},
	);

	server.tool(
		"umami_get_user_teams",
		"Get all teams a user belongs to",
		{
			userId: schemas.userId,
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ userId, page, pageSize }) => {
			return wrap(async () => client.getUserTeams(userId, { page, pageSize }));
		},
	);

	if (isToolAllowed("umami_create_user", config)) {
		server.tool(
			"umami_create_user",
			"[WRITE] Create a new user (admin only, self-hosted)",
			{
				username: z.string().describe("Username"),
				password: z.string().describe("Password"),
				role: z.enum(["admin", "user", "view-only"]).describe("User role"),
			},
			async ({ username, password, role }) => {
				if (!isToolAllowed("umami_create_user", config)) return readonlyError("umami_create_user");
				return wrap(async () => {
					const result = await client.createUser({ username, password, role });
					return { message: "User created", ...result };
				});
			},
		);
	}

	if (isToolAllowed("umami_update_user", config)) {
		server.tool(
			"umami_update_user",
			"[WRITE] Update a user's details (admin only, self-hosted)",
			{
				userId: schemas.userId,
				username: z.string().optional().describe("New username"),
				password: z.string().optional().describe("New password"),
				role: z.enum(["admin", "user", "view-only"]).optional().describe("New role"),
			},
			async ({ userId, username, password, role }) => {
				if (!isToolAllowed("umami_update_user", config)) return readonlyError("umami_update_user");
				return wrap(async () => {
					const data: { username?: string; password?: string; role?: string } = {};
					if (username !== undefined) data.username = username;
					if (password !== undefined) data.password = password;
					if (role !== undefined) data.role = role;
					await client.updateUser(userId, data);
					return `User ${userId} updated`;
				});
			},
		);
	}

	if (isToolAllowed("umami_delete_user", config)) {
		server.tool(
			"umami_delete_user",
			"[DESTRUCTIVE] Permanently delete a user (admin only, self-hosted)",
			{ userId: schemas.userId, confirm: schemas.confirm },
			async ({ userId, confirm }) => {
				if (!isToolAllowed("umami_delete_user", config)) return readonlyError("umami_delete_user");
				const check = checkConfirmation("umami_delete_user", { userId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.deleteUser(userId);
					return `User ${userId} deleted`;
				});
			},
		);
	}
}
