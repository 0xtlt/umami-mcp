import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import { checkConfirmation, isToolAllowed, readonlyError } from "./safety";

const baseConfig: Config = {
	umamiApiUrl: "https://example.com",
	umamiToken: "test-token",
	timeout: 30000,
	debug: false,
	readonly: false,
	requireConfirm: false,
};

describe("safety", () => {
	test("isToolAllowed allows read tools in readonly mode", () => {
		const config = { ...baseConfig, readonly: true };
		expect(isToolAllowed("umami_list_websites", config)).toBe(true);
		expect(isToolAllowed("umami_get_website_stats", config)).toBe(true);
	});

	test("isToolAllowed blocks write tools in readonly mode", () => {
		const config = { ...baseConfig, readonly: true };
		expect(isToolAllowed("umami_create_website", config)).toBe(false);
		expect(isToolAllowed("umami_update_website", config)).toBe(false);
	});

	test("isToolAllowed blocks destructive tools in readonly mode", () => {
		const config = { ...baseConfig, readonly: true };
		expect(isToolAllowed("umami_delete_website", config)).toBe(false);
		expect(isToolAllowed("umami_reset_website", config)).toBe(false);
	});

	test("isToolAllowed allows everything in normal mode", () => {
		expect(isToolAllowed("umami_delete_website", baseConfig)).toBe(true);
		expect(isToolAllowed("umami_create_website", baseConfig)).toBe(true);
	});

	test("checkConfirmation allows when requireConfirm is false", () => {
		const result = checkConfirmation("umami_delete_website", {}, baseConfig);
		expect(result.proceed).toBe(true);
	});

	test("checkConfirmation blocks destructive without confirm", () => {
		const config = { ...baseConfig, requireConfirm: true };
		const result = checkConfirmation("umami_delete_website", { websiteId: "abc" }, config);
		expect(result.proceed).toBe(false);
		expect(result.response?.isError).toBe(true);
	});

	test("checkConfirmation allows destructive with confirm=true", () => {
		const config = { ...baseConfig, requireConfirm: true };
		const result = checkConfirmation(
			"umami_delete_website",
			{ websiteId: "abc", confirm: true },
			config,
		);
		expect(result.proceed).toBe(true);
	});

	test("readonlyError returns error response", () => {
		const result = readonlyError("umami_create_website");
		expect(result.isError).toBe(true);
		expect(result.content[0].text).toContain("read-only mode");
	});
});
