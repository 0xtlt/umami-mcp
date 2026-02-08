#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { UmamiClient } from "./client";
import { loadConfig } from "./config";
import { registerPrompts } from "./prompts";
import { registerResources } from "./resources";
import { registerAuthTools } from "./tools/auth";
import { registerEventTools } from "./tools/events";
import { registerRealtimeTools } from "./tools/realtime";
import { registerReportTools } from "./tools/reports";
import { registerSessionTools } from "./tools/sessions";
import { registerShareTools } from "./tools/shares";
import { registerStatsTools } from "./tools/stats";
import { registerTeamTools } from "./tools/teams";
import { registerUserTools } from "./tools/users";
import { registerWebsiteTools } from "./tools/websites";

async function main() {
	const config = loadConfig();
	const client = new UmamiClient(config);

	const server = new McpServer(
		{
			name: "umami-mcp",
			version: "1.0.0",
		},
		{
			instructions: `Umami Analytics MCP server for querying website analytics from self-hosted Umami instances.

## Safety Modes
- **UMAMI_READONLY=true**: Only read operations are available (list, get, stats)
- **UMAMI_REQUIRE_CONFIRM=true**: Destructive operations (delete, reset) require confirm: true parameter

## Authentication
- Supports token-based auth (UMAMI_TOKEN) or username/password (UMAMI_USERNAME + UMAMI_PASSWORD)
- Token is obtained automatically via /api/auth/login if using credentials

## Response Format
- List operations return **summaries** (id, name, domain/type) for token efficiency
- Get operations return **full details** with \`_actions\` hints for next steps
- [WRITE] tools modify state (create, update)
- [DESTRUCTIVE] tools may cause data loss (delete, reset)

## Common Workflows
1. **Site overview**: list_websites → get_website → get_website_stats
2. **Realtime monitoring**: get_realtime (countries, urls, referrers, events, series, totals)
3. **Traffic analysis**: get_website_pageviews + get_website_metrics (by path, referrer, country)
4. **Active visitors**: get_website_active (last 5 min count)
5. **Deep metrics**: get_website_metrics_expanded (pageviews, visitors, bounces, totaltime per metric)
6. **Session analysis**: get_website_sessions → get_session → get_session_activity
7. **Event tracking**: get_website_events → get_event_data → get_event_data_stats
8. **Event time series**: get_website_events_series (events over time)
9. **Custom events**: send_event (track pageviews or custom events)
10. **User management**: get_user → create_user / update_user / delete_user (admin, self-hosted)
11. **Team management**: list_teams → get_team → get_team_users / get_team_websites
12. **Reports**: list_reports → get_report / create_report / run_funnel_report / run_retention_report
13. **Share pages**: list_website_shares → create_website_share / get_share
14. **Session data**: get_session_data_properties → get_session_data_values
15. **Website setup**: create_website → get_website (verify) → create_website_share`,
		},
	);

	// Register all tools
	registerAuthTools(server, client);
	registerWebsiteTools(server, client, config);
	registerStatsTools(server, client);
	registerRealtimeTools(server, client);
	registerSessionTools(server, client);
	registerEventTools(server, client, config);
	registerUserTools(server, client, config);
	registerTeamTools(server, client, config);
	registerReportTools(server, client, config);
	registerShareTools(server, client, config);

	// Register resources
	registerResources(server, client);

	// Register prompts
	registerPrompts(server);

	// Start server with stdio transport
	const transport = new StdioServerTransport();
	await server.connect(transport);

	if (config.debug) {
		console.error("[DEBUG] Umami MCP server started");
		if (config.readonly) console.error("[DEBUG] Read-only mode enabled");
		if (config.requireConfirm)
			console.error("[DEBUG] Confirmation required for destructive operations");
	}
}

main().catch((error) => {
	console.error("Failed to start Umami MCP server:", error);
	process.exit(1);
});
