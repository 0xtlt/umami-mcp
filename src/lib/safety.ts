import type { Config } from "../config";
import { errorResponse, type ToolResponse } from "./wrap";

export type OperationLevel = "read" | "write" | "destructive";

export interface ToolMeta {
	level: OperationLevel;
	dangerWarning?: string;
}

const TOOL_METADATA: Record<string, ToolMeta> = {
	// Auth - read
	umami_verify_token: { level: "read" },
	// Me - read
	umami_get_me: { level: "read" },
	umami_get_my_websites: { level: "read" },
	umami_get_my_teams: { level: "read" },
	// Websites - read
	umami_list_websites: { level: "read" },
	umami_get_website: { level: "read" },
	// Websites - write
	umami_create_website: { level: "write" },
	umami_update_website: { level: "write" },
	// Websites - destructive
	umami_delete_website: {
		level: "destructive",
		dangerWarning: "Permanently deletes the website and all its data.",
	},
	umami_reset_website: {
		level: "destructive",
		dangerWarning: "Erases all analytics data for this website. Cannot be undone.",
	},
	// Website stats - read
	umami_get_website_stats: { level: "read" },
	umami_get_website_pageviews: { level: "read" },
	umami_get_website_metrics: { level: "read" },
	umami_get_website_metrics_expanded: { level: "read" },
	umami_get_website_active: { level: "read" },
	umami_get_website_events_series: { level: "read" },
	// Sessions - read
	umami_get_website_sessions: { level: "read" },
	umami_get_website_sessions_stats: { level: "read" },
	umami_get_session: { level: "read" },
	umami_get_session_activity: { level: "read" },
	umami_get_session_properties: { level: "read" },
	umami_get_session_data_properties: { level: "read" },
	umami_get_session_data_values: { level: "read" },
	// Events - read
	umami_get_website_events: { level: "read" },
	umami_get_event_data: { level: "read" },
	umami_get_event_data_events: { level: "read" },
	umami_get_event_data_fields: { level: "read" },
	umami_get_event_data_properties: { level: "read" },
	umami_get_event_data_values: { level: "read" },
	umami_get_event_data_stats: { level: "read" },
	// Realtime - read
	umami_get_realtime: { level: "read" },
	// Sending stats - write
	umami_send_event: { level: "write" },
	// Users - read
	umami_get_user: { level: "read" },
	umami_get_user_websites: { level: "read" },
	umami_get_user_teams: { level: "read" },
	// Users - write
	umami_create_user: { level: "write" },
	umami_update_user: { level: "write" },
	// Users - destructive
	umami_delete_user: {
		level: "destructive",
		dangerWarning: "Permanently deletes the user account.",
	},
	// Teams - read
	umami_list_teams: { level: "read" },
	umami_get_team: { level: "read" },
	umami_get_team_users: { level: "read" },
	umami_get_team_user: { level: "read" },
	umami_get_team_websites: { level: "read" },
	// Teams - write
	umami_create_team: { level: "write" },
	umami_update_team: { level: "write" },
	umami_join_team: { level: "write" },
	umami_add_team_user: { level: "write" },
	umami_update_team_user: { level: "write" },
	// Teams - destructive
	umami_delete_team: {
		level: "destructive",
		dangerWarning: "Permanently deletes the team.",
	},
	umami_remove_team_user: {
		level: "destructive",
		dangerWarning: "Removes the user from the team.",
	},
	// Reports - read
	umami_list_reports: { level: "read" },
	umami_get_report: { level: "read" },
	// Reports - write
	umami_create_report: { level: "write" },
	umami_update_report: { level: "write" },
	umami_run_funnel_report: { level: "read" },
	umami_run_retention_report: { level: "read" },
	umami_run_breakdown_report: { level: "read" },
	// Reports - destructive
	umami_delete_report: {
		level: "destructive",
		dangerWarning: "Permanently deletes the report.",
	},
	// Share - read
	umami_get_share: { level: "read" },
	umami_list_website_shares: { level: "read" },
	// Share - write
	umami_create_share: { level: "write" },
	umami_update_share: { level: "write" },
	umami_create_website_share: { level: "write" },
	// Share - destructive
	umami_delete_share: {
		level: "destructive",
		dangerWarning: "Permanently deletes the share link.",
	},
};

export function getToolMeta(name: string): ToolMeta | undefined {
	return TOOL_METADATA[name];
}

export function isToolAllowed(toolName: string, config: Config): boolean {
	const meta = TOOL_METADATA[toolName];
	if (!meta) return true;
	if (config.readonly && meta.level !== "read") return false;
	return true;
}

export function checkConfirmation(
	toolName: string,
	args: Record<string, unknown>,
	config: Config,
): { proceed: boolean; response?: ToolResponse } {
	const meta = TOOL_METADATA[toolName];
	if (!config.requireConfirm || meta?.level !== "destructive") {
		return { proceed: true };
	}
	if (args.confirm === true) {
		return { proceed: true };
	}
	return {
		proceed: false,
		response: errorResponse(
			JSON.stringify(
				{
					confirmation_required: true,
					action: toolName,
					warning: meta.dangerWarning || "This is a destructive operation.",
					message: "Call again with confirm: true to proceed.",
					example: { ...args, confirm: true },
				},
				null,
				2,
			),
		),
	};
}

export function readonlyError(toolName: string): ToolResponse {
	return errorResponse(
		`Operation '${toolName}' blocked: server is in read-only mode (UMAMI_READONLY=true)`,
	);
}
