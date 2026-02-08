import { describe, expect, test } from "bun:test";
import { createTestClient, hoursAgo, now, readState, updateState } from "./setup";

const client = createTestClient();

describe("09 - Reports", () => {
	test("createReport", async () => {
		const { websiteId } = readState();
		const report = await client.createReport({
			websiteId: websiteId!,
			name: "Integration Test Report",
			type: "funnel",
			description: "Test report for integration tests",
			parameters: {
				startAt: hoursAgo(24),
				endAt: now(),
				urls: ["/home", "/pricing"],
				window: 60,
			},
		});
		expect(report).toHaveProperty("id");
		expect(report.name).toBe("Integration Test Report");
		expect(report.type).toBe("funnel");
		updateState({ reportId: report.id });
	});

	test("getReport", async () => {
		const { reportId } = readState();
		expect(reportId).toBeDefined();
		const report = await client.getReport(reportId!);
		expect(report.id).toBe(reportId!);
		expect(report.name).toBe("Integration Test Report");
	});

	test("listReports contains created report", async () => {
		const { reportId, websiteId } = readState();
		const res = await client.listReports({ websiteId: websiteId! });
		expect(res).toHaveProperty("data");
		expect(Array.isArray(res.data)).toBe(true);
		const found = res.data.find((r) => r.id === reportId);
		expect(found).toBeDefined();
	});

	test("updateReport", async () => {
		const { reportId, websiteId } = readState();
		const updated = await client.updateReport(reportId!, {
			websiteId: websiteId!,
			type: "funnel",
			name: "Updated Test Report",
			parameters: {
				startDate: new Date(hoursAgo(24)).toISOString().split("T")[0],
				endDate: new Date().toISOString().split("T")[0],
				steps: [
					{ type: "path", value: "/home" },
					{ type: "path", value: "/pricing" },
				],
				window: 60,
			},
		});
		expect(updated.name).toBe("Updated Test Report");
	});

	test("runFunnelReport", async () => {
		const { websiteId } = readState();
		const result = await client.runFunnelReport(websiteId!, {
			startDate: new Date(hoursAgo(24)).toISOString().split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
			steps: [
				{ type: "path", value: "/home" },
				{ type: "path", value: "/pricing" },
			],
			window: 60,
		});
		expect(result).toBeDefined();
	});

	test("runRetentionReport", async () => {
		const { websiteId } = readState();
		const result = await client.runRetentionReport(websiteId!, {
			startDate: new Date(hoursAgo(24 * 7)).toISOString().split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
		});
		expect(result).toBeDefined();
	});

	test("runBreakdownReport", async () => {
		const { websiteId } = readState();
		const result = await client.runBreakdownReport(websiteId!, {
			startDate: new Date(hoursAgo(24)).toISOString().split("T")[0],
			endDate: new Date().toISOString().split("T")[0],
			fields: ["path"],
		});
		expect(result).toBeDefined();
	});
});
