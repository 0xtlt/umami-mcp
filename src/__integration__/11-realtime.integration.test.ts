import { describe, expect, test } from "bun:test";
import { createTestClient, readState } from "./setup";

const client = createTestClient();

describe("11 - Realtime", () => {
	test("getRealtime returns expected shape", async () => {
		const { websiteId } = readState();
		const data = await client.getRealtime(websiteId!);
		expect(data).toHaveProperty("countries");
		expect(data).toHaveProperty("urls");
		expect(data).toHaveProperty("referrers");
		expect(data).toHaveProperty("events");
		expect(data).toHaveProperty("series");
		expect(data).toHaveProperty("totals");
		expect(data.series).toHaveProperty("views");
		expect(data.series).toHaveProperty("visitors");
		expect(data.totals).toHaveProperty("views");
		expect(data.totals).toHaveProperty("visitors");
		expect(typeof data.totals.views).toBe("number");
	});
});
