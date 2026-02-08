import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { UmamiClient } from "../client";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "../lib/safety";
import * as schemas from "../lib/schemas";
import { wrap } from "../lib/wrap";
import { toReportSummary } from "../types/api";

export function registerReportTools(server: McpServer, client: UmamiClient, config: Config) {
	server.tool(
		"umami_list_reports",
		"List all saved reports (returns summary: id, name, type, websiteId)",
		{},
		async () => {
			return wrap(async () => {
				const reports = await client.listReports();
				return reports.map(toReportSummary);
			});
		},
	);

	server.tool(
		"umami_get_report",
		"Get detailed information about a saved report",
		{ reportId: schemas.reportId },
		async ({ reportId }) => {
			return wrap(async () => client.getReport(reportId));
		},
	);

	if (isToolAllowed("umami_create_report", config)) {
		server.tool(
			"umami_create_report",
			"[WRITE] Create a new report",
			{
				websiteId: schemas.websiteId,
				name: z.string().describe("Report name"),
				type: z
					.enum([
						"attribution",
						"breakdown",
						"funnel",
						"goal",
						"journey",
						"retention",
						"revenue",
						"utm",
					])
					.describe("Report type"),
				description: z.string().optional().describe("Report description"),
				parameters: z
					.record(z.string(), z.unknown())
					.describe("Report parameters (date range, filters, etc.)"),
			},
			async ({ websiteId, name, type, description, parameters }) => {
				if (!isToolAllowed("umami_create_report", config))
					return readonlyError("umami_create_report");
				return wrap(async () => {
					const result = await client.createReport({
						websiteId,
						name,
						type,
						description,
						parameters,
					});
					return { message: "Report created", ...result };
				});
			},
		);
	}

	if (isToolAllowed("umami_update_report", config)) {
		server.tool(
			"umami_update_report",
			"[WRITE] Update a saved report",
			{
				reportId: schemas.reportId,
				name: z.string().optional().describe("New report name"),
				description: z.string().optional().describe("New description"),
				parameters: z.record(z.string(), z.unknown()).optional().describe("Updated parameters"),
			},
			async ({ reportId, name, description, parameters }) => {
				if (!isToolAllowed("umami_update_report", config))
					return readonlyError("umami_update_report");
				return wrap(async () => {
					await client.updateReport(reportId, { name, description, parameters });
					return `Report ${reportId} updated`;
				});
			},
		);
	}

	if (isToolAllowed("umami_delete_report", config)) {
		server.tool(
			"umami_delete_report",
			"[DESTRUCTIVE] Permanently delete a report",
			{ reportId: schemas.reportId, confirm: schemas.confirm },
			async ({ reportId, confirm }) => {
				if (!isToolAllowed("umami_delete_report", config))
					return readonlyError("umami_delete_report");
				const check = checkConfirmation("umami_delete_report", { reportId, confirm }, config);
				if (!check.proceed) return check.response!;
				return wrap(async () => {
					await client.deleteReport(reportId);
					return `Report ${reportId} deleted`;
				});
			},
		);
	}

	server.tool(
		"umami_run_funnel_report",
		"Run a funnel analysis report (understand conversion and drop-off rates)",
		{
			websiteId: schemas.websiteId,
			parameters: z
				.record(z.string(), z.unknown())
				.describe("Funnel parameters: urls (array of step URLs), dateRange, window"),
		},
		async ({ websiteId, parameters }) => {
			return wrap(async () => client.runFunnelReport(websiteId, parameters));
		},
	);

	server.tool(
		"umami_run_retention_report",
		"Run a retention analysis report (measure user return rates)",
		{
			websiteId: schemas.websiteId,
			parameters: z
				.record(z.string(), z.unknown())
				.describe("Retention parameters: dateRange, cohortSize"),
		},
		async ({ websiteId, parameters }) => {
			return wrap(async () => client.runRetentionReport(websiteId, parameters));
		},
	);

	server.tool(
		"umami_run_breakdown_report",
		"Run a breakdown analysis report (segment data with filters)",
		{
			websiteId: schemas.websiteId,
			parameters: z
				.record(z.string(), z.unknown())
				.describe("Breakdown parameters: dateRange, filters, fields"),
		},
		async ({ websiteId, parameters }) => {
			return wrap(async () => client.runBreakdownReport(websiteId, parameters));
		},
	);
}
