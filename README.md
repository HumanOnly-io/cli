# HumanOnly CLI (`ho`)

The official command-line tool for [HumanOnly](https://humanonly.io) professionals. Browse the marketplace, manage engagements, track time, push deliverables, and manage your workflow — all from the terminal.

## Installation

```bash
npm install -g @humanonly/cli
```

Requires Node.js 18 or later.

## Quick Start

```bash
# Authenticate
ho login

# See your requests and engagements
ho list

# Browse the marketplace
ho marketplace
ho marketplace --search "kubernetes" --space devops

# View a request
ho view cmmv68dnm000079uebhtl4px8

# Check out a request or engagement (sets active context)
ho checkout cmmv68dnm000079uebhtl4px8

# Check current context
ho status

# Start tracking time
ho timer start "debugging ingress controller"

# Stop timer (auto-submits time entry)
ho timer stop

# Log time manually
ho log 2h30m "API integration work"

# Push a deliverable (zips current directory)
ho push
ho push ./report.pdf --final

# Check upcoming meetings
ho meetings

# Check your stats
ho stats
```

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `ho login` | Authenticate via browser (opens HumanOnly login) |
| `ho login --token <key>` | Authenticate with an API token |
| `ho logout` | Log out and clear credentials |
| `ho whoami` | Show current logged-in user |

### Your Work

| Command | Description |
|---------|-------------|
| `ho list` | List all your requests and engagements in one table |
| `ho requests` | List your requests |
| `ho engagements` | List your active engagements |
| `ho engagements --status ACTIVE` | Filter engagements by status |

### Marketplace

| Command | Description |
|---------|-------------|
| `ho marketplace` | Browse open requests |
| `ho marketplace --popular` | Sort by popularity |
| `ho marketplace --search <query>` | Search by keyword |
| `ho marketplace --space <slug>` | Filter by space |
| `ho marketplace --limit <n>` | Limit results (default: 20) |
| `ho view <id>` | View full request details |
| `ho view <id> --verbose` | Show full description |

### Context

| Command | Description |
|---------|-------------|
| `ho checkout <id>` | Set active context (accepts request ID or engagement ID) |
| `ho use <id>` | Alias for `checkout` |
| `ho status` | Show current context + timer status |

When you `checkout` a request you don't have an engagement on, you'll be prompted to submit a bid interactively.

### Time Tracking

| Command | Description |
|---------|-------------|
| `ho timer start [description]` | Start tracking time |
| `ho timer stop` | Stop timer and submit time entry |
| `ho timer status` | Show elapsed time |
| `ho log <duration> [description]` | Log time manually |

Duration formats: `1h`, `30m`, `1h30m`, `90m`, `1.5h`

### Deliverables

| Command | Description |
|---------|-------------|
| `ho push` | Zip and upload current directory |
| `ho push <file>` | Upload a specific file |
| `ho push --final` | Mark as final deliverable |

Respects `.gitignore` (or `.hoignore`). Always excludes `node_modules`, `.git`, `.env`, etc.

### Meetings

| Command | Description |
|---------|-------------|
| `ho meetings` | View upcoming meetings |

### Stats

| Command | Description |
|---------|-------------|
| `ho stats` | View your pro stats (rating, earnings, badges) |
| `ho stats --earnings` | Detailed earnings breakdown |
| `ho stats --month` | This month's activity |

### Config

| Command | Description |
|---------|-------------|
| `ho config` | Show current configuration |
| `ho config set apiUrl <url>` | Override API URL |

## Shell Completions

Tab completions are available for Bash and Zsh. They provide auto-complete for all commands, subcommands, and flags.

### Bash

Add to your `~/.bashrc`:

```bash
source <(ho completions bash)
```

Or copy the completion file directly:

```bash
cp $(npm root -g)/@humanonly/cli/completions/ho.bash ~/.local/share/bash-completion/completions/ho
```

### Zsh

Add to your `~/.zshrc`:

```bash
source <(ho completions zsh)
```

Or copy to your completions directory:

```bash
cp $(npm root -g)/@humanonly/cli/completions/ho.zsh ~/.zsh/completions/_ho
```

Then reload your shell or run `exec $SHELL`.

## Configuration

Config is stored at `~/.config/humanonly/config.json`. Timer state is stored at `~/.config/humanonly/timer.json`.

## Development

```bash
git clone https://github.com/HumanOnly-io/cli.git
cd cli
npm install
node bin/ho.js --help
```

## License

MIT
