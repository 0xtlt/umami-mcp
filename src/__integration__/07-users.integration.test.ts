import { describe, expect, test } from "bun:test";
import { createTestClient, readState, updateState } from "./setup";

const client = createTestClient();

describe("07 - Users", () => {
	test("createUser", async () => {
		const user = await client.createUser({
			username: "integration-test-user",
			password: "test-password-123",
			role: "user",
		});
		expect(user).toHaveProperty("id");
		expect(user.username).toBe("integration-test-user");
		expect(user.role).toBe("user");
		updateState({ userId: user.id });
	});

	test("getUser", async () => {
		const { userId } = readState();
		expect(userId).toBeDefined();
		const user = await client.getUser(userId!);
		expect(user.id).toBe(userId!);
		expect(user.username).toBe("integration-test-user");
	});

	test("updateUser", async () => {
		const { userId } = readState();
		const updated = await client.updateUser(userId!, {
			role: "admin",
		});
		expect(updated).toBeDefined();
	});

	test("getUserWebsites", async () => {
		const { adminUserId } = readState();
		expect(adminUserId).toBeDefined();
		const res = await client.getUserWebsites(adminUserId!);
		expect(res).toHaveProperty("data");
		expect(Array.isArray(res.data)).toBe(true);
	});

	test("getUserTeams", async () => {
		const { adminUserId } = readState();
		const res = await client.getUserTeams(adminUserId!);
		expect(res).toHaveProperty("data");
		expect(Array.isArray(res.data)).toBe(true);
	});
});
