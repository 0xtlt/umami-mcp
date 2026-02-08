import type { Config } from "./config";
import { NetworkError, UmamiApiError } from "./lib/errors";
import type {
	EventData,
	Metric,
	MetricExpanded,
	PaginatedResponse,
	RealtimeData,
	Report,
	Session,
	Share,
	Team,
	TeamUser,
	User,
	Website,
	WebsiteStats,
} from "./types/api";

export class UmamiClient {
	private baseUrl: string;
	private token: string | undefined;
	private username: string | undefined;
	private password: string | undefined;
	private timeout: number;
	private debug: boolean;

	constructor(config: Config) {
		this.baseUrl = config.umamiApiUrl.replace(/\/$/, "");
		this.token = config.umamiToken;
		this.username = config.umamiUsername;
		this.password = config.umamiPassword;
		this.timeout = config.timeout;
		this.debug = config.debug;
	}

	async authenticate(): Promise<void> {
		if (this.token) return;
		if (!this.username || !this.password) {
			throw new UmamiApiError("No token or credentials provided", 401);
		}

		const url = `${this.baseUrl}/api/auth/login`;
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: this.username, password: this.password }),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new UmamiApiError(
				`Authentication failed: ${response.statusText}`,
				response.status,
				text,
			);
		}

		const data = (await response.json()) as { token: string };
		this.token = data.token;
	}

	private async request<T>(
		method: string,
		endpoint: string,
		body?: object,
		query?: Record<string, string | number | boolean | undefined>,
	): Promise<T> {
		await this.authenticate();

		let url = `${this.baseUrl}${endpoint}`;
		if (query) {
			const params = new URLSearchParams();
			for (const [k, v] of Object.entries(query)) {
				if (v !== undefined) params.set(k, String(v));
			}
			const qs = params.toString();
			if (qs) url += `?${qs}`;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			if (this.debug) {
				console.error(`[DEBUG] ${method} ${url}`);
			}

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
					Accept: "application/json",
					"User-Agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				},
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				throw new UmamiApiError(
					`API error: ${response.status} ${response.statusText}`,
					response.status,
					errorText,
				);
			}

			const text = await response.text();
			if (!text) return {} as T;
			try {
				return JSON.parse(text) as T;
			} catch {
				return text as T;
			}
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof UmamiApiError) throw error;
			if (error instanceof Error && error.name === "AbortError") {
				throw new NetworkError("Request timeout");
			}
			throw new NetworkError(`Network error: ${error}`);
		}
	}

	// --- Auth ---

	async verifyToken(): Promise<User> {
		return this.request<User>("POST", "/api/auth/verify");
	}

	// --- Me ---

	async getMe(): Promise<unknown> {
		return this.request("GET", "/api/me");
	}

	async getMyWebsites(includeTeams?: boolean): Promise<PaginatedResponse<Website>> {
		return this.request("GET", "/api/me/websites", undefined, {
			includeTeams: includeTeams || undefined,
		});
	}

	async getMyTeams(): Promise<PaginatedResponse<Team>> {
		return this.request("GET", "/api/me/teams");
	}

	// --- Websites ---

	async listWebsites(opts?: {
		includeTeams?: boolean;
		search?: string;
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<Website>> {
		return this.request("GET", "/api/websites", undefined, {
			includeTeams: opts?.includeTeams || undefined,
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	async getWebsite(websiteId: string): Promise<Website> {
		return this.request<Website>("GET", `/api/websites/${websiteId}`);
	}

	async createWebsite(data: {
		name: string;
		domain: string;
		shareId?: string;
		teamId?: string;
	}): Promise<Website> {
		return this.request<Website>("POST", "/api/websites", data);
	}

	async updateWebsite(
		websiteId: string,
		data: { name?: string; domain?: string; shareId?: string },
	): Promise<Website> {
		return this.request<Website>("POST", `/api/websites/${websiteId}`, data);
	}

	async deleteWebsite(websiteId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/websites/${websiteId}`);
	}

	async resetWebsite(websiteId: string): Promise<{ ok: boolean }> {
		return this.request("POST", `/api/websites/${websiteId}/reset`);
	}

	// --- Website Stats ---

	async getWebsiteStats(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<WebsiteStats> {
		return this.request("GET", `/api/websites/${websiteId}/stats`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	async getWebsitePageviews(
		websiteId: string,
		startAt: number,
		endAt: number,
		unit: string,
		opts?: { timezone?: string; compare?: string; filters?: Record<string, unknown> },
	): Promise<{
		pageviews: Array<{ x: string; y: number }>;
		sessions: Array<{ x: string; y: number }>;
	}> {
		return this.request("GET", `/api/websites/${websiteId}/pageviews`, undefined, {
			startAt,
			endAt,
			unit,
			timezone: opts?.timezone,
			compare: opts?.compare,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getWebsiteMetrics(
		websiteId: string,
		startAt: number,
		endAt: number,
		type: string,
		opts?: { limit?: number; offset?: number; filters?: Record<string, unknown> },
	): Promise<Metric[]> {
		return this.request("GET", `/api/websites/${websiteId}/metrics`, undefined, {
			startAt,
			endAt,
			type,
			limit: opts?.limit,
			offset: opts?.offset,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getWebsiteMetricsExpanded(
		websiteId: string,
		startAt: number,
		endAt: number,
		type: string,
		opts?: { limit?: number; offset?: number; filters?: Record<string, unknown> },
	): Promise<MetricExpanded[]> {
		return this.request("GET", `/api/websites/${websiteId}/metrics/expanded`, undefined, {
			startAt,
			endAt,
			type,
			limit: opts?.limit,
			offset: opts?.offset,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getWebsiteActive(websiteId: string): Promise<{ visitors: number }> {
		return this.request("GET", `/api/websites/${websiteId}/active`);
	}

	async getWebsiteEventsSeries(
		websiteId: string,
		startAt: number,
		endAt: number,
		unit: string,
		opts?: { timezone?: string; filters?: Record<string, unknown> },
	): Promise<Array<{ x: string; t: string; y: number }>> {
		return this.request("GET", `/api/websites/${websiteId}/events/series`, undefined, {
			startAt,
			endAt,
			unit,
			timezone: opts?.timezone,
			...this.flattenFilters(opts?.filters),
		});
	}

	// --- Realtime ---

	async getRealtime(websiteId: string): Promise<RealtimeData> {
		return this.request<RealtimeData>("GET", `/api/realtime/${websiteId}`);
	}

	// --- Sessions ---

	async getWebsiteSessions(
		websiteId: string,
		startAt: number,
		endAt: number,
		opts?: { search?: string; page?: number; pageSize?: number; filters?: Record<string, unknown> },
	): Promise<PaginatedResponse<Session>> {
		return this.request("GET", `/api/websites/${websiteId}/sessions`, undefined, {
			startAt,
			endAt,
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getWebsiteSessionsStats(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<unknown> {
		return this.request("GET", `/api/websites/${websiteId}/sessions/stats`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	async getSession(websiteId: string, sessionId: string): Promise<Session> {
		return this.request<Session>("GET", `/api/websites/${websiteId}/sessions/${sessionId}`);
	}

	async getSessionActivity(
		websiteId: string,
		sessionId: string,
		startAt: number,
		endAt: number,
	): Promise<unknown[]> {
		return this.request(
			"GET",
			`/api/websites/${websiteId}/sessions/${sessionId}/activity`,
			undefined,
			{
				startAt,
				endAt,
			},
		);
	}

	async getSessionProperties(websiteId: string, sessionId: string): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/sessions/${sessionId}/properties`);
	}

	async getSessionDataProperties(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/session-data/properties`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	async getSessionDataValues(
		websiteId: string,
		startAt: number,
		endAt: number,
		propertyName: string,
		filters?: Record<string, unknown>,
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/session-data/values`, undefined, {
			startAt,
			endAt,
			propertyName,
			...this.flattenFilters(filters),
		});
	}

	// --- Events ---

	async getWebsiteEvents(
		websiteId: string,
		startAt: number,
		endAt: number,
		opts?: { search?: string; page?: number; pageSize?: number; filters?: Record<string, unknown> },
	): Promise<PaginatedResponse<unknown>> {
		return this.request("GET", `/api/websites/${websiteId}/events`, undefined, {
			startAt,
			endAt,
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getEventData(websiteId: string, eventId: string): Promise<EventData[]> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/${eventId}`);
	}

	async getEventDataEvents(
		websiteId: string,
		startAt: number,
		endAt: number,
		opts?: { event?: string; filters?: Record<string, unknown> },
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/events`, undefined, {
			startAt,
			endAt,
			event: opts?.event,
			...this.flattenFilters(opts?.filters),
		});
	}

	async getEventDataFields(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/fields`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	async getEventDataProperties(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/properties`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	async getEventDataValues(
		websiteId: string,
		startAt: number,
		endAt: number,
		event: string,
		propertyName: string,
		filters?: Record<string, unknown>,
	): Promise<unknown[]> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/values`, undefined, {
			startAt,
			endAt,
			event,
			propertyName,
			...this.flattenFilters(filters),
		});
	}

	async getEventDataStats(
		websiteId: string,
		startAt: number,
		endAt: number,
		filters?: Record<string, unknown>,
	): Promise<unknown> {
		return this.request("GET", `/api/websites/${websiteId}/event-data/stats`, undefined, {
			startAt,
			endAt,
			...this.flattenFilters(filters),
		});
	}

	// --- Send event ---

	async sendEvent(data: {
		hostname: string;
		url: string;
		website: string;
		name?: string;
		referrer?: string;
		title?: string;
		tag?: string;
		data?: Record<string, unknown>;
	}): Promise<{ sessionId?: string; visitId?: string }> {
		const url = `${this.baseUrl}/api/send`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			},
			body: JSON.stringify({
				type: "event",
				payload: {
					...data,
					language: "en-US",
					screen: "1920x1080",
				},
			}),
		});
		if (!response.ok) {
			const text = await response.text();
			throw new UmamiApiError(`Send event failed: ${response.statusText}`, response.status, text);
		}
		const text = await response.text();
		if (!text) return {};
		try {
			return JSON.parse(text);
		} catch {
			return {};
		}
	}

	// --- Users (admin only, self-hosted) ---

	async getUser(userId: string): Promise<User> {
		return this.request<User>("GET", `/api/users/${userId}`);
	}

	async createUser(data: { username: string; password: string; role: string }): Promise<User> {
		return this.request<User>("POST", "/api/users", data);
	}

	async updateUser(
		userId: string,
		data: { username?: string; password?: string; role?: string },
	): Promise<User> {
		return this.request<User>("POST", `/api/users/${userId}`, data);
	}

	async deleteUser(userId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/users/${userId}`);
	}

	async getUserWebsites(
		userId: string,
		opts?: { includeTeams?: boolean; search?: string; page?: number; pageSize?: number },
	): Promise<PaginatedResponse<Website>> {
		return this.request("GET", `/api/users/${userId}/websites`, undefined, {
			includeTeams: opts?.includeTeams || undefined,
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	async getUserTeams(
		userId: string,
		opts?: { page?: number; pageSize?: number },
	): Promise<PaginatedResponse<Team>> {
		return this.request("GET", `/api/users/${userId}/teams`, undefined, {
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	// --- Teams ---

	async listTeams(opts?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Team>> {
		return this.request("GET", "/api/teams", undefined, {
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	async getTeam(teamId: string): Promise<Team> {
		return this.request<Team>("GET", `/api/teams/${teamId}`);
	}

	async createTeam(name: string): Promise<Team> {
		const result = await this.request<Team | [Team, unknown]>("POST", "/api/teams", { name });
		return Array.isArray(result) ? result[0] : result;
	}

	async updateTeam(teamId: string, data: { name?: string; accessCode?: string }): Promise<Team> {
		return this.request<Team>("POST", `/api/teams/${teamId}`, data);
	}

	async deleteTeam(teamId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/teams/${teamId}`);
	}

	async joinTeam(accessCode: string): Promise<unknown> {
		return this.request("POST", "/api/teams/join", { accessCode });
	}

	async getTeamUsers(
		teamId: string,
		opts?: { search?: string; page?: number; pageSize?: number },
	): Promise<PaginatedResponse<TeamUser>> {
		return this.request("GET", `/api/teams/${teamId}/users`, undefined, {
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	async getTeamUser(teamId: string, userId: string): Promise<TeamUser> {
		return this.request<TeamUser>("GET", `/api/teams/${teamId}/users/${userId}`);
	}

	async addTeamUser(teamId: string, userId: string, role: string): Promise<unknown> {
		return this.request("POST", `/api/teams/${teamId}/users`, { userId, role });
	}

	async updateTeamUser(teamId: string, userId: string, role: string): Promise<unknown> {
		return this.request("POST", `/api/teams/${teamId}/users/${userId}`, { role });
	}

	async removeTeamUser(teamId: string, userId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/teams/${teamId}/users/${userId}`);
	}

	async getTeamWebsites(
		teamId: string,
		opts?: { search?: string; page?: number; pageSize?: number },
	): Promise<PaginatedResponse<Website>> {
		return this.request("GET", `/api/teams/${teamId}/websites`, undefined, {
			search: opts?.search,
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	// --- Reports ---

	async listReports(opts?: {
		websiteId?: string;
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResponse<Report>> {
		return this.request("GET", "/api/reports", undefined, {
			websiteId: opts?.websiteId,
			page: opts?.page,
			pageSize: opts?.pageSize,
		});
	}

	async getReport(reportId: string): Promise<Report> {
		return this.request<Report>("GET", `/api/reports/${reportId}`);
	}

	async createReport(data: {
		websiteId: string;
		name: string;
		type: string;
		description?: string;
		parameters: Record<string, unknown>;
	}): Promise<Report> {
		return this.request<Report>("POST", "/api/reports", data);
	}

	async updateReport(
		reportId: string,
		data: {
			websiteId?: string;
			type?: string;
			name?: string;
			description?: string;
			parameters?: Record<string, unknown>;
		},
	): Promise<Report> {
		return this.request<Report>("POST", `/api/reports/${reportId}`, data);
	}

	async deleteReport(reportId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/reports/${reportId}`);
	}

	async runFunnelReport(
		websiteId: string,
		parameters: Record<string, unknown>,
		filters?: Record<string, unknown>,
	): Promise<unknown> {
		return this.request("POST", "/api/reports/funnel", {
			websiteId,
			type: "funnel",
			parameters,
			filters: filters ?? {},
		});
	}

	async runRetentionReport(
		websiteId: string,
		parameters: Record<string, unknown>,
		filters?: Record<string, unknown>,
	): Promise<unknown> {
		return this.request("POST", "/api/reports/retention", {
			websiteId,
			type: "retention",
			parameters,
			filters: filters ?? {},
		});
	}

	async runBreakdownReport(
		websiteId: string,
		parameters: Record<string, unknown>,
		filters?: Record<string, unknown>,
	): Promise<unknown> {
		return this.request("POST", "/api/reports/breakdown", {
			websiteId,
			type: "breakdown",
			parameters,
			filters: filters ?? {},
		});
	}

	// --- Shares ---

	async getShare(shareId: string): Promise<Share> {
		return this.request<Share>("GET", `/api/share/id/${shareId}`);
	}

	async createShare(data: {
		entityId: string;
		shareType: number;
		name: string;
		slug: string;
		parameters?: Record<string, unknown>;
	}): Promise<Share> {
		return this.request<Share>("POST", "/api/share", data);
	}

	async updateShare(
		shareId: string,
		data: { name?: string; slug?: string; parameters?: Record<string, unknown> },
	): Promise<Share> {
		return this.request<Share>("POST", `/api/share/id/${shareId}`, data);
	}

	async deleteShare(shareId: string): Promise<{ ok: boolean }> {
		return this.request("DELETE", `/api/share/id/${shareId}`);
	}

	async listWebsiteShares(websiteId: string): Promise<PaginatedResponse<Share>> {
		return this.request("GET", `/api/websites/${websiteId}/shares`);
	}

	async createWebsiteShare(
		websiteId: string,
		data: { name: string; parameters?: Record<string, unknown> },
	): Promise<Share> {
		return this.request<Share>("POST", `/api/websites/${websiteId}/shares`, data);
	}

	// --- Helpers ---

	private flattenFilters(
		filters?: Record<string, unknown>,
	): Record<string, string | number | boolean | undefined> {
		if (!filters) return {};
		const result: Record<string, string | number | boolean | undefined> = {};
		for (const [k, v] of Object.entries(filters)) {
			if (v !== undefined && v !== null) {
				result[k] = typeof v === "object" ? JSON.stringify(v) : (v as string | number | boolean);
			}
		}
		return result;
	}
}
