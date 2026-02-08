import { describe, expect, test } from "bun:test";
import { createTestClient, hoursAgo, now, readState } from "./setup";

const client = createTestClient();

describe("05 - Sessions", () => {
	test("getWebsiteSessions", async () => {
		const { websiteId } = readState();
		const res = await client.getWebsiteSessions(websiteId!, hoursAgo(1), now());
		expect(res).toHaveProperty("data");
		expect(res).toHaveProperty("count");
		expect(Array.isArray(res.data)).toBe(true);
	});

	test("getWebsiteSessionsStats", async () => {
		const { websiteId } = readState();
		const stats = await client.getWebsiteSessionsStats(websiteId!, hoursAgo(1), now());
		expect(stats).toBeDefined();
	});

	test("getSession", async () => {
		const { websiteId, sessionId } = readState();
		expect(sessionId).toBeDefined();
		const session = await client.getSession(websiteId!, sessionId!);
		expect(session).toHaveProperty("id");
		expect(session).toHaveProperty("websiteId");
	});

	test("getSessionActivity", async () => {
		const { websiteId, sessionId } = readState();
		const activity = await client.getSessionActivity(websiteId!, sessionId!, hoursAgo(1), now());
		expect(Array.isArray(activity)).toBe(true);
	});

	test("getSessionProperties", async () => {
		const { websiteId, sessionId } = readState();
		const props = await client.getSessionProperties(websiteId!, sessionId!);
		expect(Array.isArray(props)).toBe(true);
	});

	test("getSessionDataProperties", async () => {
		const { websiteId } = readState();
		const props = await client.getSessionDataProperties(websiteId!, hoursAgo(1), now());
		expect(Array.isArray(props)).toBe(true);
	});

	test("getSessionDataValues", async () => {
		const { websiteId } = readState();
		const values = await client.getSessionDataValues(websiteId!, hoursAgo(1), now(), "browser");
		expect(Array.isArray(values)).toBe(true);
	});
});
