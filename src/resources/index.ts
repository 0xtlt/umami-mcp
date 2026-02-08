import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { UmamiClient } from "../client";
import { formatError } from "../lib/wrap";
import { toReportSummary, toTeamSummary, toWebsiteSummary } from "../types/api";

export function registerResources(server: McpServer, client: UmamiClient) {
	server.resource("umami://websites", "List of all tracked websites (summary)", async () => {
		try {
			const result = await client.listWebsites();
			return {
				contents: [
					{
						uri: "umami://websites",
						mimeType: "application/json",
						text: JSON.stringify(result.data.map(toWebsiteSummary), null, 2),
					},
				],
			};
		} catch (error) {
			return {
				contents: [
					{
						uri: "umami://websites",
						mimeType: "text/plain",
						text: formatError(error),
					},
				],
			};
		}
	});

	server.resource("umami://teams", "List of all teams (summary)", async () => {
		try {
			const result = await client.listTeams();
			return {
				contents: [
					{
						uri: "umami://teams",
						mimeType: "application/json",
						text: JSON.stringify(result.data.map(toTeamSummary), null, 2),
					},
				],
			};
		} catch (error) {
			return {
				contents: [
					{
						uri: "umami://teams",
						mimeType: "text/plain",
						text: formatError(error),
					},
				],
			};
		}
	});

	server.resource("umami://reports", "List of all saved reports (summary)", async () => {
		try {
			const res = await client.listReports();
			return {
				contents: [
					{
						uri: "umami://reports",
						mimeType: "application/json",
						text: JSON.stringify(res.data.map(toReportSummary), null, 2),
					},
				],
			};
		} catch (error) {
			return {
				contents: [
					{
						uri: "umami://reports",
						mimeType: "text/plain",
						text: formatError(error),
					},
				],
			};
		}
	});
}
