import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { type ResponseAction, wrap, wrapWithActions } from "../lib/wrap";
import type { Website } from "../types/api";
import { toWebsiteSummary } from "../types/api";

function getWebsiteActions(id: string): ResponseAction[] {
	return [
		{ tool: "umami_get_website_stats", args: { websiteId: id }, hint: "View stats" },
		{ tool: "umami_get_website_active", args: { websiteId: id }, hint: "Active visitors" },
		{ tool: "umami_get_realtime", args: { websiteId: id }, hint: "Realtime data" },
		{ tool: "umami_get_website_metrics", args: { websiteId: id }, hint: "View metrics" },
		{ tool: "umami_update_website", args: { websiteId: id }, hint: "Update" },
		{ tool: "umami_delete_website", args: { websiteId: id }, hint: "Delete" },
	];
}

export function registerWebsiteTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_list_websites",
		"List all tracked websites (returns summary: id, name, domain)",
		{
			includeTeams: z.boolean().optional().describe("Include team websites"),
			search: schemas.search,
			page: schemas.page,
			pageSize: schemas.pageSize,
		},
		async ({ includeTeams, search, page, pageSize }) => {
			return wrap(async () => {
				const result = await client.listWebsites({ includeTeams, search, page, pageSize });
				return { ...result, data: result.data.map(toWebsiteSummary) };
			});
		},
	);

	server.tool(
		"umami_get_website",
		"Get detailed information about a specific website",
		{ websiteId: schemas.websiteId },
		async ({ websiteId }) => {
			return wrapWithActions(
				() => client.getWebsite(websiteId),
				(website: Website) => getWebsiteActions(website.id),
			);
		},
	);

	if (isToolAllowed("umami_create_website", config)) {
		server.tool(
			"umami_create_website",
			"[WRITE] Create a new website to track",
			{
				name: z.string().describe("Website name"),
				domain: z.string().describe("Website domain (e.g. example.com)"),
				shareId: z.string().optional().describe("Share ID for public access"),
				teamId: schemas.teamId.optional().describe("Team ID to assign the website to"),
			},
			async ({ name, domain, shareId, teamId }) => {
				if (!isToolAllowed("umami_create_website", config))
					return readonlyError("umami_create_website");
				return wrap(async () => {
					const result = await client.createWebsite({ name, domain, shareId, teamId });
					return { message: "Website created", ...result };
				});
			},
		);
	}

	if (isToolAllowed("umami_update_website", config)) {
		server.tool(
			"umami_update_website",
			"[WRITE] Update a website's configuration",
			{
				websiteId: schemas.websiteId,
				name: z.string().optional().describe("New website name"),
				domain: z.string().optional().describe("New domain"),
				shareId: z.string().optional().describe("New share ID"),
			},
			async ({ websiteId, name, domain, shareId }) => {
				if (!isToolAllowed("umami_update_website", config))
					return readonlyError("umami_update_website");
				return wrap(async () => {
					const data: { name?: string; domain?: string; shareId?: string } = {};
					if (name !== undefined) data.name = name;
					if (domain !== undefined) data.domain = domain;
					if (shareId !== undefined) data.shareId = shareId;
					await client.updateWebsite(websiteId, data);
					return `Website ${websiteId} updated`;
				});
			},
		);
	}

	if (isToolAllowed("umami_delete_website", config)) {
		server.tool(
			"umami_delete_website",
			"[DESTRUCTIVE] Permanently delete a website and all its data",
			{ websiteId: schemas.websiteId, confirm: schemas.confirm },
			async ({ websiteId, confirm }) => {
				if (!isToolAllowed("umami_delete_website", config))
					return readonlyError("umami_delete_website");
				const check = checkConfirmation("umami_delete_website", { websiteId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.deleteWebsite(websiteId);
					return `Website ${websiteId} deleted`;
				});
			},
		);
	}

	if (isToolAllowed("umami_reset_website", config)) {
		server.tool(
			"umami_reset_website",
			"[DESTRUCTIVE] Erase all analytics data for a website (keeps config)",
			{ websiteId: schemas.websiteId, confirm: schemas.confirm },
			async ({ websiteId, confirm }) => {
				if (!isToolAllowed("umami_reset_website", config))
					return readonlyError("umami_reset_website");
				const check = checkConfirmation("umami_reset_website", { websiteId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.resetWebsite(websiteId);
					return `Website ${websiteId} data reset`;
				});
			},
		);
	}
}
