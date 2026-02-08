import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerEventTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_get_website_events",
		"Get website event details within a time range",
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
				client.getWebsiteEvents(websiteId, startAt, endAt, { search, page, pageSize, filters }),
			);
		},
	);

	server.tool(
		"umami_get_event_data",
		"Get event data for a specific event",
		{
			websiteId: schemas.websiteId,
			eventId: schemas.eventId,
		},
		async ({ websiteId, eventId }) => {
			return wrap(async () => client.getEventData(websiteId, eventId));
		},
	);

	server.tool(
		"umami_get_event_data_events",
		"Get event data names, properties, and counts",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			event: z.string().optional().describe("Filter by event name"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, event, filters }) => {
			return wrap(async () =>
				client.getEventDataEvents(websiteId, startAt, endAt, { event, filters }),
			);
		},
	);

	server.tool(
		"umami_get_event_data_fields",
		"Get event data property and value counts",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getEventDataFields(websiteId, startAt, endAt, filters));
		},
	);

	server.tool(
		"umami_get_event_data_properties",
		"Get event name and property counts",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getEventDataProperties(websiteId, startAt, endAt, filters));
		},
	);

	server.tool(
		"umami_get_event_data_values",
		"Get event data counts for a given event and property",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			event: z.string().describe("Event name"),
			propertyName: z.string().describe("Property name"),
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, event, propertyName, filters }) => {
			return wrap(async () =>
				client.getEventDataValues(websiteId, startAt, endAt, event, propertyName, filters),
			);
		},
	);

	server.tool(
		"umami_get_event_data_stats",
		"Get aggregated event stats (events, properties, records counts)",
		{
			websiteId: schemas.websiteId,
			startAt: schemas.startAt,
			endAt: schemas.endAt,
			filters: schemas.filters,
		},
		async ({ websiteId, startAt, endAt, filters }) => {
			return wrap(async () => client.getEventDataStats(websiteId, startAt, endAt, filters));
		},
	);

	// Send event (write operation)
	if (isToolAllowed("umami_send_event", config)) {
		server.tool(
			"umami_send_event",
			"[WRITE] Send a custom event to Umami (track pageview or custom event)",
			{
				website: z.string().describe("Website ID to track event for"),
				hostname: z.string().describe("Hostname (e.g. example.com)"),
				url: z.string().describe("Page URL path (e.g. /about)"),
				name: z.string().optional().describe("Event name (omit for pageview)"),
				referrer: z.string().optional().describe("Referrer URL"),
				title: z.string().optional().describe("Page title"),
				tag: z.string().optional().describe("Tag for categorization"),
				data: z.record(z.string(), z.unknown()).optional().describe("Additional event data"),
			},
			async ({ website, hostname, url, name, referrer, title, tag, data }) => {
				if (!isToolAllowed("umami_send_event", config)) return readonlyError("umami_send_event");
				return wrap(async () =>
					client.sendEvent({ website, hostname, url, name, referrer, title, tag, data }),
				);
			},
		);
	}
}
