import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UmamiClient } from "../client";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";

export function registerRealtimeTools(server: McpServer, client: UmamiClient) {
	server.tool(
		"umami_get_realtime",
		"Get realtime analytics for a website (last 30 min): active visitors, page views, countries, referrers, events, and time series",
		{ websiteId: schemas.websiteId },
		async ({ websiteId }) => {
			return wrap(async () => client.getRealtime(websiteId));
		},
	);
}
