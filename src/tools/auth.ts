import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UmamiClient } from "../client";
import { wrap } from "../lib/wrap";

export function registerAuthTools(server: McpServer, client: UmamiClient) {
	server.tool(
		"umami_verify_token",
		"Verify the current authentication token and get user info",
		{},
		async () => {
			return wrap(async () => client.verifyToken());
		},
	);

	server.tool(
		"umami_get_me",
		"Get information about the current authenticated user",
		{},
		async () => {
			return wrap(async () => client.getMe());
		},
	);

	server.tool(
		"umami_get_my_websites",
		"Get all websites belonging to the current user",
		{},
		async () => {
			return wrap(async () => client.getMyWebsites(true));
		},
	);

	server.tool("umami_get_my_teams", "Get all teams the current user belongs to", {}, async () => {
		return wrap(async () => client.getMyTeams());
	});
}
