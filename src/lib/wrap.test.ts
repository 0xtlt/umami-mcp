import { describe, expect, test } from "bun:test";
import { NetworkError, UmamiApiError } from "./errors";
import { errorResponse, formatError, textResponse, wrap, wrapWithActions } from "./wrap";

describe("wrap", () => {
	test("wrap returns JSON result on success", async () => {
		const response = await wrap(async () => ({ hello: "world" }));
		expect(response.isError).toBeUndefined();
		expect(response.content[0].text).toContain('"hello"');
	});

	test("wrap returns error on failure", async () => {
		const response = await wrap(async () => {
			throw new Error("test error");
		});
		expect(response.isError).toBe(true);
		expect(response.content[0].text).toContain("test error");
	});

	test("wrapWithActions includes _actions", async () => {
		const response = await wrapWithActions(
			async () => ({ id: "123" }),
			() => [{ tool: "test_tool", args: { id: "123" }, hint: "Test" }],
		);
		const parsed = JSON.parse(response.content[0].text);
		expect(parsed._actions).toHaveLength(1);
		expect(parsed._actions[0].tool).toBe("test_tool");
	});

	test("formatError handles UmamiApiError", () => {
		const err = new UmamiApiError("err", 404);
		expect(formatError(err)).toContain("not found");
	});

	test("formatError handles NetworkError", () => {
		const err = new NetworkError("timeout");
		expect(formatError(err)).toContain("Network error");
	});

	test("textResponse returns correct format", () => {
		const res = textResponse("hello");
		expect(res.content[0]).toEqual({ type: "text", text: "hello" });
		expect(res.isError).toBeUndefined();
	});

	test("errorResponse returns correct format", () => {
		const res = errorResponse("oops");
		expect(res.content[0]).toEqual({ type: "text", text: "oops" });
		expect(res.isError).toBe(true);
	});
});
