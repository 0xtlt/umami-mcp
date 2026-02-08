import { readFileSync, writeFileSync } from "node:fs";
import { UmamiClient } from "../client";

const STATE_FILE = "/tmp/umami-integration-state.json";

export interface IntegrationState {
	websiteId?: string;
	sessionId?: string;
	visitId?: string;
	userId?: string;
	teamId?: string;
	reportId?: string;
	adminUserId?: string;
	eventId?: string;
}

export function readState(): IntegrationState {
	try {
		return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
	} catch {
		return {};
	}
}

export function writeState(state: IntegrationState): void {
	writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function updateState(partial: Partial<IntegrationState>): IntegrationState {
	const state = { ...readState(), ...partial };
	writeState(state);
	return state;
}

export function resetState(): void {
	writeState({});
}

export function createTestClient(): UmamiClient {
	return new UmamiClient({
		umamiApiUrl: process.env.UMAMI_TEST_URL ?? "http://localhost:3099",
		umamiUsername: "admin",
		umamiPassword: "umami",
		timeout: 30000,
		debug: false,
		readonly: false,
		requireConfirm: false,
	});
}

export function hoursAgo(h: number): number {
	return Date.now() - h * 60 * 60 * 1000;
}

export function now(): number {
	return Date.now();
}
