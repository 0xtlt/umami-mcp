import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerSessionTools(server: McpServer, client: UmamiClient) {
	server.tool(
		"umami_get_website_sessions",
		"Get session details within a time range",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			search: schemas.search,
			page: schemas.page,
			pageSize: schemas.pageSize,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, search, page, pageSize, filters }) => {
			return wrap(async () =>
				client.getWebsiteSessions(websiteId, startAt, endAt, { search, page, pageSize, filters }),
			);
		},
	);

	server.tool(
		"umami_get_website_sessions_stats",
		"Get summarized session statistics (pageviews, visitors, visits, countries, events)",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getWebsiteSessionsStats(websiteId, startAt, endAt, filters));
		},
	);

	server.tool(
		"umami_get_session",
		"Get details for an individual session",
		{
			websiteId: schemas.websiteId,
			sessionId: schemas.sessionId,
		},
		async ({ websiteId, sessionId }) => {
			return wrap(async () => client.getSession(websiteId, sessionId));
		},
	);

	server.tool(
		"umami_get_session_activity",
		"Get activity history for a specific session",
		{
			websiteId: schemas.websiteId,
			sessionId: schemas.sessionId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
		},
		async ({ websiteId, sessionId, startAt, endAt }) => {
			return wrap(async () => client.getSessionActivity(websiteId, sessionId, startAt, endAt));
		},
	);

	server.tool(
		"umami_get_session_properties",
		"Get properties for a specific session",
		{
			websiteId: schemas.websiteId,
			sessionId: schemas.sessionId,
		},
		async ({ websiteId, sessionId }) => {
			return wrap(async () => client.getSessionProperties(websiteId, sessionId));
		},
	);

	server.tool(
		"umami_get_session_data_properties",
		"Get session data counts by property name",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getSessionDataProperties(websiteId, startAt, endAt, filters));
		},
	);

	server.tool(
		"umami_get_session_data_values",
		"Get session data counts for a specific property",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			propertyName: z.string().describe("Property name to get values for"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, propertyName, filters }) => {
			return wrap(async () =>
				client.getSessionDataValues(websiteId, startAt, endAt, propertyName, filters),
			);
		},
	);
}
