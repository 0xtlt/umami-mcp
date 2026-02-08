# umami-mcp

MCP (Model Context Protocol) server for [Umami Analytics](https://umami.is/) - query your self-hosted analytics from AI assistants.

## Features

- **50+ tools** covering the full Umami API
- **Realtime analytics** - active visitors, live pageviews, events
- **Website stats** - pageviews, metrics, sessions, events
- **Management** - websites, teams, users, reports, shares
- **Safety modes** - read-only mode, confirmation for destructive ops
- **Token-efficient** - list operations return summaries, get operations return full details
- **Auto-auth** - supports token or username/password authentication

## Installation

```bash
bun install
```

## Configuration

Set environment variables:

```bash
# Required: Umami API URL
UMAMI_API_URL=https://your-umami-instance.com

# Auth option 1: API token
UMAMI_TOKEN=your-api-token

# Auth option 2: Username/password (token obtained automatically)
UMAMI_USERNAME=admin
UMAMI_PASSWORD=your-password

# Optional
UMAMI_TIMEOUT=30000        # Request timeout in ms (default: 30000)
UMAMI_READONLY=true        # Only allow read operations
UMAMI_REQUIRE_CONFIRM=true # Require confirm: true for destructive ops
DEBUG=true                 # Enable debug logging
```

## Usage

### Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json`):

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

### MCP Inspector

```bash
bun run inspect
```

### Development

```bash
bun run dev       # Watch mode
bun run check     # Lint + typecheck + test
bun run typecheck # Type check only
```

## Tools

### Analytics (Read)
| Tool | Description |
|------|-------------|
| `umami_get_website_stats` | Summarized stats (pageviews, visitors, bounces) |
| `umami_get_website_pageviews` | Time series pageview data |
| `umami_get_website_metrics` | Breakdown by path, browser, OS, country, etc. |
| `umami_get_website_metrics_expanded` | Expanded metrics with engagement data |
| `umami_get_website_active` | Active visitors (last 5 min) |
| `umami_get_website_events_series` | Event time series |
| `umami_get_realtime` | Realtime data (last 30 min) |

### Sessions (Read)
| Tool | Description |
|------|-------------|
| `umami_get_website_sessions` | Session list with pagination |
| `umami_get_website_sessions_stats` | Session summary stats |
| `umami_get_session` | Individual session details |
| `umami_get_session_activity` | Session activity history |
| `umami_get_session_properties` | Session properties |
| `umami_get_session_data_properties` | Session data by property |
| `umami_get_session_data_values` | Session data values |

### Events (Read)
| Tool | Description |
|------|-------------|
| `umami_get_website_events` | Event list with pagination |
| `umami_get_event_data` | Individual event data |
| `umami_get_event_data_events` | Event names and counts |
| `umami_get_event_data_fields` | Event property fields |
| `umami_get_event_data_properties` | Event properties |
| `umami_get_event_data_values` | Event data values |
| `umami_get_event_data_stats` | Aggregated event stats |

### Websites (CRUD)
| Tool | Description |
|------|-------------|
| `umami_list_websites` | List all websites |
| `umami_get_website` | Get website details |
| `umami_create_website` | Create website |
| `umami_update_website` | Update website |
| `umami_delete_website` | Delete website |
| `umami_reset_website` | Reset website data |

### Teams, Users, Reports, Shares
See full tool list with `bun run inspect`.

## Safety Modes

- **UMAMI_READONLY=true** - Only read operations (stats, metrics, lists)
- **UMAMI_REQUIRE_CONFIRM=true** - Destructive ops need `confirm: true`

## License

MIT
