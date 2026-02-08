import { z } from "zod";

export const websiteId = z.string().min(1).max(100).describe("Website ID (UUID)");

export const userId = z.string().min(1).max(100).describe("User ID (UUID)");

export const teamId = z.string().min(1).max(100).describe("Team ID (UUID)");

export const sessionId = z.string().min(1).max(100).describe("Session ID (UUID)");

export const reportId = z.string().min(1).max(100).describe("Report ID (UUID)");

export const shareId = z.string().min(1).max(100).describe("Share ID");

export const eventId = z.string().min(1).max(100).describe("Event ID (UUID)");

export const confirm = z
	.boolean()
	.optional()
	.describe("Set to true to confirm this destructive operation");

export const startAt = z.number().describe("Start timestamp in milliseconds");

export const endAt = z.number().describe("End timestamp in milliseconds");

export const unit = z
	.enum(["minute", "hour", "day", "month", "year"])
	.describe("Time unit for grouping data");

export const timezone = z
	.string()
	.optional()
	.describe("Timezone (e.g. America/Los_Angeles, Europe/Paris)");

export const page = z.number().int().min(1).optional().describe("Page number for pagination");

export const pageSize = z
	.number()
	.int()
	.min(1)
	.max(200)
	.optional()
	.describe("Items per page (max 200)");

export const search = z.string().optional().describe("Search text filter");

export const metricType = z
	.enum([
		"path",
		"entry",
		"exit",
		"title",
		"query",
		"referrer",
		"channel",
		"domain",
		"country",
		"region",
		"city",
		"browser",
		"os",
		"device",
		"language",
		"screen",
		"event",
		"hostname",
		"tag",
		"distinctId",
	])
	.describe("Metric type to retrieve");

export const filters = z
	.record(z.string(), z.unknown())
	.optional()
	.describe(
		"Filter parameters: path, referrer, title, query, browser, os, device, country, region, city, hostname, tag, distinctId",
	);
