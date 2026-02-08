import { describe, expect, test } from "bun:test";
import { createTestClient, readState, updateState } from "./setup";

const client = createTestClient();

describe("02 - Websites", () => {
	test("createWebsite", async () => {
		const website = await client.createWebsite({
			name: "Integration Test Site",
			domain: "integration-test.local",
		});
		expect(website).toHaveProperty("id");
		expect(website.name).toBe("Integration Test Site");
		expect(website.domain).toBe("integration-test.local");
		updateState({ websiteId: website.id });
	});

	test("getWebsite", async () => {
		const { websiteId } = readState();
		expect(websiteId).toBeDefined();
		const website = await client.getWebsite(websiteId!);
		expect(website.id).toBe(websiteId!);
		expect(website.name).toBe("Integration Test Site");
	});

	test("listWebsites contains created website", async () => {
		const { websiteId } = readState();
		const res = await client.listWebsites();
		expect(res.data.length).toBeGreaterThanOrEqual(1);
		const found = res.data.find((w) => w.id === websiteId);
		expect(found).toBeDefined();
	});

	test("updateWebsite", async () => {
		const { websiteId } = readState();
		const updated = await client.updateWebsite(websiteId!, {
			name: "Integration Test Site Updated",
		});
		expect(updated.name).toBe("Integration Test Site Updated");
	});

	test("resetWebsite succeeds", async () => {
		const { websiteId } = readState();
		const res = await client.resetWebsite(websiteId!);
		expect(res).toBeDefined();
	});
});
