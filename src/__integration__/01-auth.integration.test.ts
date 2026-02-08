import { describe, expect, test } from "bun:test";
import { createTestClient, resetState, updateState } from "./setup";

const client = createTestClient();

describe("01 - Auth", () => {
	test("reset state", () => {
		resetState();
	});

	test("verifyToken returns user shape", async () => {
		const user = await client.verifyToken();
		expect(user).toHaveProperty("id");
		expect(user).toHaveProperty("username");
		expect(user.username).toBe("admin");
		updateState({ adminUserId: user.id });
	});

	test("getMe returns current user", async () => {
		const me = (await client.getMe()) as { user: { id: string; username: string } };
		expect(me).toHaveProperty("user");
		expect(me.user).toHaveProperty("id");
		expect(me.user).toHaveProperty("username");
	});

	test("getMyWebsites returns paginated response", async () => {
		const res = await client.getMyWebsites();
		expect(res).toHaveProperty("data");
		expect(res).toHaveProperty("count");
		expect(Array.isArray(res.data)).toBe(true);
	});

	test("getMyTeams returns paginated response", async () => {
		const res = await client.getMyTeams();
		expect(res).toHaveProperty("data");
		expect(res).toHaveProperty("count");
		expect(Array.isArray(res.data)).toBe(true);
	});
});
