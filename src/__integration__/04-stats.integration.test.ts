import { describe, expect, test } from "bun:test";
import { createTestClient, hoursAgo, now, readState } from "./setup";

const client = createTestClient();

describe("04 - Stats", () => {
	test("getWebsiteStats", async () => {
		const { websiteId } = readState();
		const stats = await client.getWebsiteStats(websiteId!, hoursAgo(1), now());
		expect(stats).toHaveProperty("pageviews");
		expect(stats).toHaveProperty("visitors");
		expect(stats).toHaveProperty("visits");
		expect(stats).toHaveProperty("bounces");
		expect(stats).toHaveProperty("totaltime");
	});

	test("getWebsitePageviews", async () => {
		const { websiteId } = readState();
		const res = await client.getWebsitePageviews(websiteId!, hoursAgo(1), now(), "hour");
		expect(res).toHaveProperty("pageviews");
		expect(res).toHaveProperty("sessions");
		expect(Array.isArray(res.pageviews)).toBe(true);
		expect(Array.isArray(res.sessions)).toBe(true);
	});

	test("getWebsiteMetrics", async () => {
		const { websiteId } = readState();
		const metrics = await client.getWebsiteMetrics(websiteId!, hoursAgo(1), now(), "path");
		expect(Array.isArray(metrics)).toBe(true);
	});

	test("getWebsiteMetricsExpanded", async () => {
		const { websiteId } = readState();
		const metrics = await client.getWebsiteMetricsExpanded(websiteId!, hoursAgo(1), now(), "path");
		expect(Array.isArray(metrics)).toBe(true);
	});

	test("getWebsiteActive", async () => {
		const { websiteId } = readState();
		const res = await client.getWebsiteActive(websiteId!);
		expect(res).toHaveProperty("visitors");
		expect(typeof res.visitors).toBe("number");
	});

	test("getWebsiteEventsSeries", async () => {
		const { websiteId } = readState();
		const series = await client.getWebsiteEventsSeries(websiteId!, hoursAgo(1), now(), "hour", {
			timezone: "UTC",
		});
		expect(Array.isArray(series)).toBe(true);
	});
});
