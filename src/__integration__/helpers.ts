import type { UmamiClient } from "../client";

const PAGES = ["/home", "/about", "/pricing", "/docs", "/blog"];
const EVENTS = [
	{ name: "signup_click", data: { plan: "pro" } },
	{ name: "download", data: { file: "guide.pdf" } },
	{ name: "signup_click", data: { plan: "free" } },
	{ name: "purchase", data: { amount: 49.99, currency: "USD" } },
];

export async function seedEvents(
	client: UmamiClient,
	websiteId: string,
): Promise<{ sessionId: string; visitId: string }> {
	let sessionId = "";
	let visitId = "";

	for (const page of PAGES) {
		const res = await client.sendEvent({
			hostname: "integration-test.local",
			url: page,
			website: websiteId,
			title: `Page ${page}`,
		});
		if (!sessionId && res.sessionId) {
			sessionId = res.sessionId;
			visitId = res.visitId ?? "";
		}
	}

	for (const evt of EVENTS) {
		await client.sendEvent({
			hostname: "integration-test.local",
			url: "/home",
			website: websiteId,
			name: evt.name,
			data: evt.data,
		});
	}

	return { sessionId, visitId };
}
