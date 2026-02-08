import { describe, expect, test } from "bun:test";
import { createTestClient, readState, updateState } from "./setup";

const client = createTestClient();

describe("08 - Teams", () => {
	test("createTeam", async () => {
		const team = await client.createTeam("Integration Test Team");
		expect(team).toHaveProperty("id");
		expect(team.name).toBe("Integration Test Team");
		updateState({ teamId: team.id });
	});

	test("getTeam", async () => {
		const { teamId } = readState();
		expect(teamId).toBeDefined();
		const team = await client.getTeam(teamId!);
		expect(team.id).toBe(teamId!);
		expect(team.name).toBe("Integration Test Team");
	});

	test("listTeams contains created team", async () => {
		const { teamId } = readState();
		const res = await client.listTeams();
		expect(res.data.length).toBeGreaterThanOrEqual(1);
		const found = res.data.find((t) => t.id === teamId);
		expect(found).toBeDefined();
	});

	test("updateTeam", async () => {
		const { teamId } = readState();
		const updated = await client.updateTeam(teamId!, { name: "Updated Test Team" });
		expect(updated.name).toBe("Updated Test Team");
	});

	test("getTeamUsers", async () => {
		const { teamId } = readState();
		const res = await client.getTeamUsers(teamId!);
		expect(res).toHaveProperty("data");
		expect(Array.isArray(res.data)).toBe(true);
	});

	test("addTeamUser", async () => {
		const { teamId, userId } = readState();
		expect(userId).toBeDefined();
		const res = await client.addTeamUser(teamId!, userId!, "team-member");
		expect(res).toBeDefined();
	});

	test("getTeamUser", async () => {
		const { teamId, userId } = readState();
		const teamUser = await client.getTeamUser(teamId!, userId!);
		expect(teamUser).toHaveProperty("id");
		expect(teamUser).toHaveProperty("role");
	});

	test("updateTeamUser", async () => {
		const { teamId, userId } = readState();
		const res = await client.updateTeamUser(teamId!, userId!, "team-manager");
		expect(res).toBeDefined();
	});

	test("getTeamWebsites", async () => {
		const { teamId } = readState();
		const res = await client.getTeamWebsites(teamId!);
		expect(res).toHaveProperty("data");
		expect(Array.isArray(res.data)).toBe(true);
	});

	test("removeTeamUser", async () => {
		const { teamId, userId } = readState();
		const res = await client.removeTeamUser(teamId!, userId!);
		expect(res).toBeDefined();
	});
});
