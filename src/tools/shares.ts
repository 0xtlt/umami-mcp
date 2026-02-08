import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerShareTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_get_share",
		"Get a share page by ID",
		{ shareId: schemas.shareId },
		async ({ shareId }) => {
			return wrap(async () => client.getShare(shareId));
		},
	);

	server.tool(
		"umami_list_website_shares",
		"List all share pages for a website",
		{ websiteId: schemas.websiteId },
		async ({ websiteId }) => {
			return wrap(async () => client.listWebsiteShares(websiteId));
		},
	);

	if (isToolAllowed("umami_create_share", config)) {
		server.tool(
			"umami_create_share",
			"[WRITE] Create a new share page",
			{
				entityId: z.string().describe("Entity ID to share"),
				shareType: z.number().describe("Share type: 1=website, 2=link, 3=pixel"),
				name: z.string().describe("Share name"),
				slug: z.string().describe("URL slug for the share"),
				parameters: z.record(z.string(), z.unknown()).optional().describe("Share parameters"),
			},
			async ({ entityId, shareType, name, slug, parameters }) => {
				if (!isToolAllowed("umami_create_share", config))
					return readonlyError("umami_create_share");
				return wrap(async () =>
					client.createShare({ entityId, shareType, name, slug, parameters }),
				);
			},
		);
	}

	if (isToolAllowed("umami_update_share", config)) {
		server.tool(
			"umami_update_share",
			"[WRITE] Update a share page",
			{
				shareId: schemas.shareId,
				name: z.string().optional().describe("New name"),
				slug: z.string().optional().describe("New slug"),
				parameters: z.record(z.string(), z.unknown()).optional().describe("New parameters"),
			},
			async ({ shareId, name, slug, parameters }) => {
				if (!isToolAllowed("umami_update_share", config))
					return readonlyError("umami_update_share");
				return wrap(async () => {
					await client.updateShare(shareId, { name, slug, parameters });
					return `Share ${shareId} updated`;
				});
			},
		);
	}

	if (isToolAllowed("umami_create_website_share", config)) {
		server.tool(
			"umami_create_website_share",
			"[WRITE] Create a share page for a website",
			{
				websiteId: schemas.websiteId,
				name: z.string().describe("Share name"),
				parameters: z.record(z.string(), z.unknown()).optional().describe("Share parameters"),
			},
			async ({ websiteId, name, parameters }) => {
				if (!isToolAllowed("umami_create_website_share", config))
					return readonlyError("umami_create_website_share");
				return wrap(async () => client.createWebsiteShare(websiteId, { name, parameters }));
			},
		);
	}

	if (isToolAllowed("umami_delete_share", config)) {
		server.tool(
			"umami_delete_share",
			"[DESTRUCTIVE] Permanently delete a share page",
			{ shareId: schemas.shareId, confirm: schemas.confirm },
			async ({ shareId, confirm }) => {
				if (!isToolAllowed("umami_delete_share", config))
					return readonlyError("umami_delete_share");
				const check = checkConfirmation("umami_delete_share", { shareId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.deleteShare(shareId);
					return `Share ${shareId} deleted`;
				});
			},
		);
	}
}
