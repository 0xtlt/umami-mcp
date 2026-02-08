// --- Website types ---

export interface Website {
	id: string;
	name: string;
	domain: string;
	shareId?: string;
	userId?: string;
	teamId?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface WebsiteSummary {
	id: string;
	name: string;
	domain: string;
}

// --- User types ---

export interface User {
	id: string;
	username: string;
	role: string;
	createdAt: string;
	isAdmin?: boolean;
}

export interface UserSummary {
	id: string;
	username: string;
	role: string;
}

// --- Team types ---

export interface Team {
	id: string;
	name: string;
	accessCode?: string;
	logoUrl?: string;
	createdAt: string;
	updatedAt?: string;
	members?: TeamUser[];
	_count?: { websites: number; members: number };
}

export interface TeamSummary {
	id: string;
	name: string;
}

export interface TeamUser {
	id: string;
	role: string;
	user?: User;
}

// --- Session types ---

export interface Session {
	id: string;
	websiteId: string;
	browser?: string;
	os?: string;
	device?: string;
	country?: string;
	region?: string;
	city?: string;
	language?: string;
	screen?: string;
	createdAt: string;
}

// --- Event types ---

export interface EventData {
	dataKey: string;
	stringValue?: string;
	numberValue?: number;
	dataType: number;
}

// --- Report types ---

export interface Report {
	id: string;
	userId: string;
	websiteId: string;
	type: string;
	name: string;
	description?: string;
	parameters: Record<string, unknown>;
	createdAt: string;
	updatedAt?: string;
}

export interface ReportSummary {
	id: string;
	name: string;
	type: string;
	websiteId: string;
}

// --- Share types ---

export interface Share {
	id: string;
	entityId: string;
	shareType: number;
	name: string;
	slug: string;
	parameters?: Record<string, unknown>;
	createdAt: string;
	updatedAt?: string;
}

// --- Realtime types ---

export interface RealtimeData {
	countries: Record<string, number>;
	urls: Record<string, number>;
	referrers: Record<string, number>;
	events: RealtimeEvent[];
	series: {
		views: Array<{ x: string; y: number }>;
		visitors: Array<{ x: string; y: number }>;
	};
	totals: {
		views: number;
		visitors: number;
		events: number;
		countries: number;
		timestamp: number;
	};
}

export interface RealtimeEvent {
	__type: string;
	sessionId: string;
	eventName?: string;
	createdAt: string;
	browser?: string;
	os?: string;
	device?: string;
	country?: string;
	urlPath?: string;
	referrerDomain?: string;
}

// --- Stats types ---

export interface WebsiteStats {
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
	comparison?: {
		pageviews: number;
		visitors: number;
		visits: number;
		bounces: number;
		totaltime: number;
	};
}

export interface Metric {
	x: string;
	y: number;
}

export interface MetricExpanded {
	name: string;
	pageviews: number;
	visitors: number;
	visits: number;
	bounces: number;
	totaltime: number;
}

// --- Paginated response ---

export interface PaginatedResponse<T> {
	data: T[];
	count: number;
	page: number;
	pageSize: number;
}

// --- Transformer functions ---

export function toWebsiteSummary(w: Website): WebsiteSummary {
	return { id: w.id, name: w.name, domain: w.domain };
}

export function toUserSummary(u: User): UserSummary {
	return { id: u.id, username: u.username, role: u.role };
}

export function toTeamSummary(t: Team): TeamSummary {
	return { id: t.id, name: t.name };
}

export function toReportSummary(r: Report): ReportSummary {
	return { id: r.id, name: r.name, type: r.type, websiteId: r.websiteId };
}
