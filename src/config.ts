import { z } from "zod";

const configSchema = z.object({
	umamiApiUrl: z.string().url(),
	umamiToken: z.string().min(1).optional(),
	umamiUsername: z.string().min(1).optional(),
	umamiPassword: z.string().min(1).optional(),
	timeout: z.number().default(30000),
	debug: z.boolean().default(false),
	readonly: z.boolean().default(false),
	requireConfirm: z.boolean().default(false),
});

export type Config = z.infer<typeof configSchema>;

export function validateConfig(raw: Record<string, unknown>): Config {
	const config = configSchema.parse(raw);
	if (!config.umamiToken && (!config.umamiUsername || !config.umamiPassword)) {
		console.error(
			"Configuration error: Either UMAMI_TOKEN or both UMAMI_USERNAME and UMAMI_PASSWORD must be set",
		);
		process.exit(1);
	}
	return config;
}

export function loadConfig(): Config {
	const raw = {
		umamiApiUrl: process.env.UMAMI_API_URL,
		umamiToken: process.env.UMAMI_TOKEN,
		umamiUsername: process.env.UMAMI_USERNAME,
		umamiPassword: process.env.UMAMI_PASSWORD,
		timeout: process.env.UMAMI_TIMEOUT ? Number.parseInt(process.env.UMAMI_TIMEOUT, 10) : undefined,
		debug: process.env.DEBUG === "true",
		readonly: process.env.UMAMI_READONLY === "true",
		requireConfirm: process.env.UMAMI_REQUIRE_CONFIRM === "true",
	};

	try {
		return validateConfig(raw);
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error("Configuration error:", error.flatten());
		} else {
			console.error("Configuration error:", error);
		}
		process.exit(1);
	}
}
