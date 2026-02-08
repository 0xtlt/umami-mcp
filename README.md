# umami-mcp

MCP server for [Umami Analytics](https://umami.is/). Query website stats, manage websites, teams, users, and reports directly from Claude or any MCP-compatible client.

**62 tools | 3 resources | 4 prompts**

## Installation

### Claude Code

```bash
claude mcp add umami \
  -e UMAMI_API_URL=https://your-umami-instance.com \
  -e UMAMI_TOKEN=your-api-token \
  -- npx umami-mcp
```

With username/password auth:

```bash
claude mcp add umami \
  -e UMAMI_API_URL=https://your-umami-instance.com \
  -e UMAMI_USERNAME=admin \
  -e UMAMI_PASSWORD=your-password \
  -- npx umami-mcp
```

### Codex

```bash
codex mcp add umami \
  --env UMAMI_API_URL=https://your-umami-instance.com \
  --env UMAMI_TOKEN=your-api-token \
  -- npx umami-mcp
```

### Other MCP clients

```bash
UMAMI_API_URL=https://your-umami-instance.com \
UMAMI_TOKEN=your-api-token \
npx umami-mcp
```

### From source

```bash
git clone https://github.com/0xtlt/umami-mcp
cd umami-mcp && bun install
UMAMI_API_URL=... UMAMI_TOKEN=... bun run src/index.ts
```

### Claude Desktop

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "umami": {
      "command": "bun",
      "args": ["run", "/path/to/umami-mcp/src/index.ts"],
      "env": {
        "UMAMI_API_URL": "https://your-umami-instance.com",
        "UMAMI_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Authentication

- **Umami Cloud**: Create an API key in **Settings > API Keys**
- **Self-hosted**: Use username/password — the server obtains a token automatically via `/api/auth/login`

## Available Tools

### Auth (4)

| Tool | Description |
|------|-------------|
| `umami_verify_token` | Verify the current authentication token and get user info |
| `umami_get_me` | Get information about the current authenticated user |
| `umami_get_my_websites` | Get all websites belonging to the current user |
| `umami_get_my_teams` | Get all teams the current user belongs to |

### Websites (6)

| Tool | Description |
|------|-------------|
| `umami_list_websites` | List all tracked websites (summary: id, name, domain) |
| `umami_get_website` | Get detailed information about a specific website |
| `umami_create_website` | [WRITE] Create a new website to track |
| `umami_update_website` | [WRITE] Update a website's configuration |
| `umami_delete_website` | [DESTRUCTIVE] Permanently delete a website and all its data |
| `umami_reset_website` | [DESTRUCTIVE] Erase all analytics data for a website (keeps config) |

### Stats (6)

| Tool | Description |
|------|-------------|
| `umami_get_website_stats` | Get summarized statistics (pageviews, visitors, visits, bounces, totaltime) |
| `umami_get_website_pageviews` | Get pageview and session counts over time (time series) |
| `umami_get_website_metrics` | Get metrics breakdown by type (path, browser, os, country, etc.) |
| `umami_get_website_metrics_expanded` | Get expanded metrics with pageviews, visitors, bounces per metric |
| `umami_get_website_active` | Get currently active visitors (last 5 minutes) |
| `umami_get_website_events_series` | Get events as time series data |

### Sessions (7)

| Tool | Description |
|------|-------------|
| `umami_get_website_sessions` | Get session details within a time range |
| `umami_get_website_sessions_stats` | Get summarized session statistics |
| `umami_get_session` | Get details for an individual session |
| `umami_get_session_activity` | Get activity history for a specific session |
| `umami_get_session_properties` | Get properties for a specific session |
| `umami_get_session_data_properties` | Get session data counts by property name |
| `umami_get_session_data_values` | Get session data counts for a specific property |

### Events (8)

| Tool | Description |
|------|-------------|
| `umami_get_website_events` | Get website event details within a time range |
| `umami_get_event_data` | Get event data for a specific event |
| `umami_get_event_data_events` | Get event data names, properties, and counts |
| `umami_get_event_data_fields` | Get event data property and value counts |
| `umami_get_event_data_properties` | Get event name and property counts |
| `umami_get_event_data_values` | Get event data counts for a given event and property |
| `umami_get_event_data_stats` | Get aggregated event stats (events, properties, records) |
| `umami_send_event` | [WRITE] Send a custom event to Umami |

### Users (6)

| Tool | Description |
|------|-------------|
| `umami_get_user` | Get user details by ID (admin only) |
| `umami_get_user_websites` | Get all websites belonging to a user |
| `umami_get_user_teams` | Get all teams a user belongs to |
| `umami_create_user` | [WRITE] Create a new user (admin only) |
| `umami_update_user` | [WRITE] Update a user's details (admin only) |
| `umami_delete_user` | [DESTRUCTIVE] Permanently delete a user (admin only) |

### Teams (12)

| Tool | Description |
|------|-------------|
| `umami_list_teams` | List all teams (summary: id, name) |
| `umami_get_team` | Get detailed information about a team |
| `umami_get_team_users` | Get all users belonging to a team |
| `umami_get_team_user` | Get a specific user within a team |
| `umami_get_team_websites` | Get all websites belonging to a team |
| `umami_create_team` | [WRITE] Create a new team |
| `umami_update_team` | [WRITE] Update a team's name or access code |
| `umami_join_team` | [WRITE] Join a team using an access code |
| `umami_add_team_user` | [WRITE] Add a user to a team |
| `umami_update_team_user` | [WRITE] Update a user's role in a team |
| `umami_delete_team` | [DESTRUCTIVE] Permanently delete a team |
| `umami_remove_team_user` | [DESTRUCTIVE] Remove a user from a team |

### Reports (8)

| Tool | Description |
|------|-------------|
| `umami_list_reports` | List all saved reports (summary: id, name, type, websiteId) |
| `umami_get_report` | Get detailed information about a saved report |
| `umami_create_report` | [WRITE] Create a new report |
| `umami_update_report` | [WRITE] Update a saved report |
| `umami_delete_report` | [DESTRUCTIVE] Permanently delete a report |
| `umami_run_funnel_report` | Run a funnel analysis report (conversion and drop-off rates) |
| `umami_run_retention_report` | Run a retention analysis report (user return rates) |
| `umami_run_breakdown_report` | Run a breakdown analysis report (segment data with filters) |

### Shares (6)

| Tool | Description |
|------|-------------|
| `umami_get_share` | Get a share page by ID |
| `umami_list_website_shares` | List all share pages for a website |
| `umami_create_share` | [WRITE] Create a new share page |
| `umami_update_share` | [WRITE] Update a share page |
| `umami_create_website_share` | [WRITE] Create a share page for a website |
| `umami_delete_share` | [DESTRUCTIVE] Permanently delete a share page |

### Realtime (1)

| Tool | Description |
|------|-------------|
| `umami_get_realtime` | Get realtime analytics (last 30 min): active visitors, pageviews, events |

## Available Resources

| URI | Description |
|-----|-------------|
| `umami://websites` | List of all tracked websites |
| `umami://teams` | List of all teams |
| `umami://reports` | List of all saved reports |

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `analytics_overview` | Get a complete analytics overview for a website |
| `realtime_dashboard` | View realtime activity on a website |
| `traffic_analysis` | Deep dive into traffic patterns and sources |
| `setup_new_website` | Guided workflow to add and configure a new website |

## Safety Modes

| Variable | Description |
|----------|-------------|
| `UMAMI_READONLY=true` | Only read operations available (stats, metrics, lists) |
| `UMAMI_REQUIRE_CONFIRM=true` | Destructive operations require `confirm: true` |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UMAMI_API_URL` | Yes | Umami instance URL (e.g. `https://analytics.example.com`) |
| `UMAMI_TOKEN` | One of token or username/password | API token from Umami dashboard |
| `UMAMI_USERNAME` | One of token or username/password | Username for auto-auth |
| `UMAMI_PASSWORD` | One of token or username/password | Password for auto-auth |
| `UMAMI_TIMEOUT` | No | Request timeout in ms (default: 30000) |
| `UMAMI_READONLY` | No | Read-only mode (default: false) |
| `UMAMI_REQUIRE_CONFIRM` | No | Require confirmation for destructive ops (default: false) |
| `DEBUG` | No | Enable debug logging (default: false) |

## Development

```bash
bun install              # Install dependencies
bun run dev              # Watch mode
bun run inspect          # MCP Inspector
bun run check            # Lint + typecheck + test
bun test                 # Run unit tests only
```

### Integration Tests

Requires Docker. Spins up Umami + PostgreSQL, runs 60 tests against the live instance.

```bash
bun run test:integration          # Full run (setup + test + teardown)
bun run test:integration:setup    # Start containers only
bun run test:integration:run      # Run tests only
bun run test:integration:teardown # Stop containers + cleanup
```

## License

MIT
