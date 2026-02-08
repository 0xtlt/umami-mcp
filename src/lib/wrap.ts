import { NetworkError, UmamiApiError } from "./errors";

export interface ToolResponse {
	[key: string]: unknown;
	content: Array<{ type: "text"; text: string }>;
	isError?: boolean;
}

export interface ResponseAction {
	tool: string;
	args: Record<string, string | number | boolean>;
	hint: string;
}

export interface EnhancedResponse<T> {
	data: T;
	_actions?: ResponseAction[];
}

export function formatError(error: unknown): string {
	if (error instanceof UmamiApiError) {
		return error.toUserMessage();
	}
	if (error instanceof NetworkError) {
		return `Network error: ${error.message}`;
	}
	if (error instanceof Error) {
		return `Error: ${error.message}`;
	}
	return `Unknown error: ${String(error)}`;
}

export async function wrap<T>(fn: () => Promise<T>): Promise<ToolResponse> {
	try {
		const result = await fn();
		return {
			content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
		};
	} catch (error) {
		return {
			content: [{ type: "text", text: formatError(error) }],
			isError: true,
		};
	}
}

export async function wrapWithActions<T>(
	fn: () => Promise<T>,
	getActions?: (result: T) => ResponseAction[],
): Promise<ToolResponse> {
	try {
		const result = await fn();
		const response: EnhancedResponse<T> = { data: result };
		if (getActions) {
			response._actions = getActions(result);
		}
		return {
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		};
	} catch (error) {
		return {
			content: [{ type: "text", text: formatError(error) }],
			isError: true,
		};
	}
}

export function textResponse(text: string): ToolResponse {
	return { content: [{ type: "text", text }] };
}

export function errorResponse(text: string): ToolResponse {
	return { content: [{ type: "text", text }], isError: true };
}
