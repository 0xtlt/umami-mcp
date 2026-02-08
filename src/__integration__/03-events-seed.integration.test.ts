import { describe, expect, test } from "bun:test";
import { seedEvents } from "./helpers";
import { createTestClient, readState, updateState } from "./setup";

const client = createTestClient();

describe("03 - Seed Events", () => {
	test("sendEvent pageviews + custom events", async () => {
		const { websiteId } = readState();
		expect(websiteId).toBeDefined();

		const { sessionId, visitId } = await seedEvents(client, websiteId!);
		expect(sessionId).toBeTruthy();
		expect(visitId).toBeTruthy();
		updateState({ sessionId, visitId });
	});

	test("wait for Umami to process events", async () => {
		await Bun.sleep(3000);
	});
});
