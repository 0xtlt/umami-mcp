import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerStatsTools(server: McpServer, client: UmamiClient) {
	server.tool(
		"umami_get_website_stats",
		"Get summarized website statistics (pageviews, visitors, visits, bounces, totaltime)",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getWebsiteStats(websiteId, startAt, endAt, filters));
		},
	);

	server.tool(
		"umami_get_website_pageviews",
		"Get pageview and session counts over time (time series data)",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			unit: schemas.unit,
			timezone: schemas.timezone,
			compare: z
				.enum(["prev", "yoy"])
				.optional()
				.describe("Comparison mode: prev (previous period) or yoy (year over year)"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, unit, timezone, compare, filters }) => {
			return wrap(async () =>
				client.getWebsitePageviews(websiteId, startAt, endAt, unit, { timezone, compare, filters }),
			);
		},
	);

	server.tool(
		"umami_get_website_metrics",
		"Get metrics breakdown by type (path, browser, os, country, referrer, device, etc.)",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			type: schemas.metricType,
			limit: z.number().int().optional().describe("Max results (default 500)"),
			offset: z.number().int().optional().describe("Offset for pagination"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, type, limit, offset, filters }) => {
			return wrap(async () =>
				client.getWebsiteMetrics(websiteId, startAt, endAt, type, { limit, offset, filters }),
			);
		},
	);

	server.tool(
		"umami_get_website_metrics_expanded",
		"Get expanded metrics with pageviews, visitors, visits, bounces, and totaltime per metric",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			type: schemas.metricType,
			limit: z.number().int().optional().describe("Max results (default 500)"),
			offset: z.number().int().optional().describe("Offset for pagination"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, type, limit, offset, filters }) => {
			return wrap(async () =>
				client.getWebsiteMetricsExpanded(websiteId, startAt, endAt, type, {
					limit,
					offset,
					filters,
				}),
			);
		},
	);

	server.tool(
		"umami_get_website_active",
		"Get the number of currently active visitors on a website (last 5 minutes)",
		{ websiteId: schemas.websiteId },
		async ({ websiteId }) => {
			return wrap(async () => client.getWebsiteActive(websiteId));
		},
	);

	server.tool(
		"umami_get_website_events_series",
		"Get events as time series data within a time range",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			unit: schemas.unit,
			timezone: schemas.timezone,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, unit, timezone, filters }) => {
			return wrap(async () =>
				client.getWebsiteEventsSeries(websiteId, startAt, endAt, unit, { timezone, filters }),
			);
		},
	);
}
