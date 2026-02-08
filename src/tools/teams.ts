import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { type ResponseAction, wrap, wrapWithActions } from "../lib/wrap";
import type { Team } from "../types/api";
import { toTeamSummary } from "../types/api";

function getTeamActions(id: string): ResponseAction[] {
	return [
		{ tool: "umami_get_team_users", args: { teamId: id }, hint: "View members" },
		{ tool: "umami_get_team_websites", args: { teamId: id }, hint: "View websites" },
		{ tool: "umami_update_team", args: { teamId: id }, hint: "Update" },
		{ tool: "umami_delete_team", args: { teamId: id }, hint: "Delete" },
	];
}

export function registerTeamTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_list_teams",
		"List all teams (returns summary: id, name)",
		{
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ page, pageSize }) => {
			return wrap(async () => {
				const result = await client.listTeams({ page, pageSize });
				return { ...result, data: result.data.map(toTeamSummary) };
			});
		},
	);

	server.tool(
		"umami_get_team",
		"Get detailed information about a team",
		{ teamId: schemas.teamId },
		async ({ teamId }) => {
			return wrapWithActions(
				() => client.getTeam(teamId),
				(team: Team) => getTeamActions(team.id),
			);
		},
	);

	server.tool(
		"umami_get_team_users",
		"Get all users belonging to a team",
		{
			teamId: schemas.teamId,
			search: schemas.search,
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ teamId, search, page, pageSize }) => {
			return wrap(async () => client.getTeamUsers(teamId, { search, page, pageSize }));
		},
	);

	server.tool(
		"umami_get_team_user",
		"Get a specific user within a team",
		{
			teamId: schemas.teamId,
			userId: schemas.userId,
		},
		async ({ teamId, userId }) => {
			return wrap(async () => client.getTeamUser(teamId, userId));
		},
	);

	server.tool(
		"umami_get_team_websites",
		"Get all websites belonging to a team",
		{
			teamId: schemas.teamId,
			search: schemas.search,
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ teamId, search, page, pageSize }) => {
			return wrap(async () => client.getTeamWebsites(teamId, { search, page, pageSize }));
		},
	);

	if (isToolAllowed("umami_create_team", config)) {
		server.tool(
			"umami_create_team",
			"[WRITE] Create a new team",
			{ name: z.string().describe("Team name") },
			async ({ name }) => {
				if (!isToolAllowed("umami_create_team", config)) return readonlyError("umami_create_team");
				return wrap(async () => {
					const result = await client.createTeam(name);
					return { message: "Team created", ...result };
				});
			},
		);
	}

	if (isToolAllowed("umami_update_team", config)) {
		server.tool(
			"umami_update_team",
			"[WRITE] Update a team's name or access code",
			{
				teamId: schemas.teamId,
				name: z.string().optional().describe("New team name"),
				accessCode: z.string().optional().describe("New access code"),
			},
			async ({ teamId, name, accessCode }) => {
				if (!isToolAllowed("umami_update_team", config)) return readonlyError("umami_update_team");
				return wrap(async () => {
					const data: { name?: string; accessCode?: string } = {};
					if (name !== undefined) data.name = name;
					if (accessCode !== undefined) data.accessCode = accessCode;
					await client.updateTeam(teamId, data);
					return `Team ${teamId} updated`;
				});
			},
		);
	}

	if (isToolAllowed("umami_join_team", config)) {
		server.tool(
			"umami_join_team",
			"[WRITE] Join a team using an access code",
			{ accessCode: z.string().describe("Team access code") },
			async ({ accessCode }) => {
				if (!isToolAllowed("umami_join_team", config)) return readonlyError("umami_join_team");
				return wrap(async () => client.joinTeam(accessCode));
			},
		);
	}

	if (isToolAllowed("umami_add_team_user", config)) {
		server.tool(
			"umami_add_team_user",
			"[WRITE] Add a user to a team",
			{
				teamId: schemas.teamId,
				userId: schemas.userId,
				role: z
					.enum(["team-member", "team-view-only", "team-manager"])
					.describe("Role in the team"),
			},
			async ({ teamId, userId, role }) => {
				if (!isToolAllowed("umami_add_team_user", config))
					return readonlyError("umami_add_team_user");
				return wrap(async () => {
					await client.addTeamUser(teamId, userId, role);
					return `User ${userId} added to team ${teamId}`;
				});
			},
		);
	}

	if (isToolAllowed("umami_update_team_user", config)) {
		server.tool(
			"umami_update_team_user",
			"[WRITE] Update a user's role in a team",
			{
				teamId: schemas.teamId,
				userId: schemas.userId,
				role: z.enum(["team-member", "team-view-only", "team-manager"]).describe("New role"),
			},
			async ({ teamId, userId, role }) => {
				if (!isToolAllowed("umami_update_team_user", config))
					return readonlyError("umami_update_team_user");
				return wrap(async () => {
					await client.updateTeamUser(teamId, userId, role);
					return `User ${userId} role updated in team ${teamId}`;
				});
			},
		);
	}

	if (isToolAllowed("umami_delete_team", config)) {
		server.tool(
			"umami_delete_team",
			"[DESTRUCTIVE] Permanently delete a team",
			{ teamId: schemas.teamId, confirm: schemas.confirm },
			async ({ teamId, confirm }) => {
				if (!isToolAllowed("umami_delete_team", config)) return readonlyError("umami_delete_team");
				const check = checkConfirmation("umami_delete_team", { teamId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.deleteTeam(teamId);
					return `Team ${teamId} deleted`;
				});
			},
		);
	}

	if (isToolAllowed("umami_remove_team_user", config)) {
		server.tool(
			"umami_remove_team_user",
			"[DESTRUCTIVE] Remove a user from a team",
			{
				teamId: schemas.teamId,
				userId: schemas.userId,
				confirm: schemas.confirm,
			},
			async ({ teamId, userId, confirm }) => {
				if (!isToolAllowed("umami_remove_team_user", config))
					return readonlyError("umami_remove_team_user");
				const check = checkConfirmation(
					"umami_remove_team_user",
					{ teamId, userId, confirm },
					config,
				);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.removeTeamUser(teamId, userId);
					return `User ${userId} removed from team ${teamId}`;
				});
			},
		);
	}
}
