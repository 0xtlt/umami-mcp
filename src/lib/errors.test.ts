import { describe, expect, test } from "bun:test";
import { ConfigurationError, NetworkError, UmamiApiError, UmamiMcpError } from "./errors";

describe("errors", () => {
	test("UmamiMcpError has correct properties", () => {
		const err = new UmamiMcpError("test error", "TEST");
		expect(err.message).toBe("test error");
		expect(err.code).toBe("TEST");
		expect(err.name).toBe("UmamiMcpError");
	});

	test("UmamiApiError returns correct user messages", () => {
		expect(new UmamiApiError("err", 401).toUserMessage()).toContain("Authentication failed");
		expect(new UmamiApiError("err", 403).toUserMessage()).toContain("Access denied");
		expect(new UmamiApiError("err", 404).toUserMessage()).toContain("not found");
		expect(new UmamiApiError("err", 429).toUserMessage()).toContain("Rate limit");
		expect(new UmamiApiError("err", 500).toUserMessage()).toContain("API error (500)");
	});

	test("UmamiApiError includes response body", () => {
		const err = new UmamiApiError("err", 401, "bad token");
		expect(err.toUserMessage()).toContain("bad token");
	});

	test("NetworkError has correct code", () => {
		const err = new NetworkError("timeout");
		expect(err.code).toBe("NETWORK_ERROR");
		expect(err.name).toBe("NetworkError");
	});

	test("ConfigurationError has correct code", () => {
		const err = new ConfigurationError("missing token");
		expect(err.code).toBe("CONFIG_ERROR");
		expect(err.name).toBe("ConfigurationError");
	});
});
