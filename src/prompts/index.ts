import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
	server.prompt(
		"analytics_overview",
		"Get a complete analytics overview for a website",
		{ websiteId: z.string().optional().describe("Website ID to analyze") },
		async ({ websiteId }) => {
			const text = websiteId
				? `I want to see a full analytics overview for website ${websiteId}. Please:
1. Call umami_get_website to get website details
2. Call umami_get_website_active to see current active visitors
3. Call umami_get_website_stats with the last 24 hours to get summary stats
4. Call umami_get_website_metrics with type "path" to see top pages
5. Call umami_get_website_metrics with type "referrer" to see traffic sources
6. Call umami_get_website_metrics with type "country" to see visitor countries
7. Call umami_get_website_metrics with type "browser" to see browser distribution
8. Summarize all findings in a clear report`
				: `I want to see analytics for my websites. Please:
1. Call umami_list_websites to show all tracked sites
2. Ask me which website to analyze
3. Then run the full analytics overview for that website`;

			return {
				messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
			};
		},
	);

	server.prompt(
		"realtime_dashboard",
		"View realtime activity on a website",
		{ websiteId: z.string().optional().describe("Website ID to monitor") },
		async ({ websiteId }) => {
			const text = websiteId
				? `Show me realtime activity for website ${websiteId}. Please:
1. Call umami_get_realtime with websiteId "${websiteId}"
2. Show active visitors count and trend
3. Show currently viewed pages (urls)
4. Show where visitors are coming from (referrers, countries)
5. Show recent events
6. Present as a clean realtime dashboard summary`
				: `I want to see realtime analytics. Please:
1. Call umami_list_websites to show all sites
2. Ask me which website to monitor
3. Show the realtime dashboard for that website`;

			return {
				messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
			};
		},
	);

	server.prompt(
		"traffic_analysis",
		"Deep dive into traffic patterns and sources",
		{
			websiteId: z.string().optional().describe("Website ID to analyze"),
			period: z.string().optional().describe("Time period: today, 7d, 30d, 90d (default: 7d)"),
		},
		async ({ websiteId, period }) => {
			const p = period || "7d";
			const text = websiteId
				? `I want a deep traffic analysis for website ${websiteId} over the last ${p}. Please:
1. Call umami_get_website_pageviews with appropriate time range and unit
2. Call umami_get_website_metrics with type "referrer" - top traffic sources
3. Call umami_get_website_metrics with type "channel" - traffic channels
4. Call umami_get_website_metrics with type "country" - geographic breakdown
5. Call umami_get_website_metrics with type "device" - device distribution
6. Call umami_get_website_metrics_expanded with type "path" - top pages with engagement data
7. Call umami_get_website_stats for the period summary
8. Identify trends, top sources, and provide actionable insights`
				: `I want a traffic analysis. Please:
1. List my websites and ask which one to analyze
2. Then perform the full traffic analysis`;

			return {
				messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
			};
		},
	);

	server.prompt(
		"setup_new_website",
		"Guided workflow to add and configure a new website for tracking",
		{},
		async () => ({
			messages: [
				{
					role: "user" as const,
					content: {
						type: "text" as const,
						text: `I want to set up a new website for Umami tracking. Please guide me:
1. Ask me for the website name and domain
2. Ask if this should belong to a team (call umami_list_teams to show options)
3. Call umami_create_website with the provided details
4. Show me the tracking script I should add to my website
5. Ask if I want to create a share link for the dashboard
6. Confirm the setup is complete and show the website details`,
					},
				},
			],
		}),
	);
}
