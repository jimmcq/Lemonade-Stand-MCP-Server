# 🍋 Lemonade Stand MCP Server

A simple, working example of a Model Context Protocol (MCP) server that lets you play the classic Lemonade Stand game through Claude Desktop.

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables AI models like Claude to interact with external data sources and tools. This server demonstrates how MCP works by implementing the classic Lemonade Stand game as a set of tools that Claude can use.

## Features

- 🌤️ Dynamic weather system affecting sales
- 💰 Business simulation with supply and demand
- 📊 Strategic pricing and inventory management
- 🏁 14-day game cycle with profit tracking
- 🎮 Fully playable through Claude Desktop

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.11.1 or higher recommended)
- [Claude Desktop](https://www.anthropic.com/claude/desktop)
- npm (comes with Node.js)

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/Lemonade-Stand-MCP-Server.git
   cd Lemonade-Stand-MCP-Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Find your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

4. Configure Claude Desktop:
   ```json
   {
     "mcpServers": {
       "lemonade-stand": {
         "command": "node",
         "args": [
           "/absolute/path/to/Lemonade-Stand-MCP-Server/server.js"
         ]
       }
     }
   }
   ```

5. Restart Claude Desktop

6. You should now see a hammer icon in Claude Desktop, indicating the MCP server is connected!

## Playing the Game

Once the server is connected, simply start a new chat with Claude and say:

> "Play a complete game of Lemonade Stand using the MCP tools available."

Claude will then:
1. Start a new game
2. Analyze the weather conditions
3. Make strategic decisions about supplies and pricing
4. Report daily results
5. Continue until Day 14 or your business fails

### Game Mechanics

- **Weather System**: Temperature and conditions affect customer traffic
- **Supply Chain**: Buy cups, lemons, sugar, and ice at different prices
- **Price Strategy**: Set your price per cup to balance profit and demand
- **Inventory Management**: Ice melts daily; manage your supplies wisely
- **Customer Demand**: Based on weather, price, and available inventory

### Available Tools

The server exposes these MCP tools to Claude:
- `start_game`: Begin a new game session
- `get_game_state`: Check current status, money, inventory, and weather
- `buy_supplies`: Purchase cups, lemons, sugar, and ice
- `set_price`: Set the price per cup of lemonade
- `sell_lemonade`: Open for business and see daily results
- `next_day`: Advance to the next day

## Configuration Examples

### For WSL Users
```json
{
  "mcpServers": {
    "lemonade-stand": {
      "command": "wsl.exe",
      "args": [
        "/home/username/.nvm/versions/node/v20.11.1/bin/node",
        "/home/username/projects/Lemonade-Stand-MCP-Server/server.js"
      ]
    }
  }
}
```

### Using NPX
```json
{
  "mcpServers": {
    "lemonade-stand": {
      "command": "npx",
      "args": [
        "/path/to/Lemonade-Stand-MCP-Server/server.js"
      ]
    }
  }
}
```

## Troubleshooting

1. **No hammer icon in Claude Desktop**:
   - Ensure Claude Desktop is up to date
   - Check that the configuration file path is correct
   - Verify Node.js is installed and accessible
   - Check Claude Desktop logs in:
     - Windows: `%APPDATA%\Claude\logs\`
     - macOS: `~/Library/Logs/Claude/`

2. **Server connection error**:
   - Verify the server path in your configuration is absolute
   - Test the server directly with `node server.js`
   - Check for any errors in the Claude Desktop logs

3. **WSL-specific issues**:
   - Ensure Node.js is installed in WSL
   - Use the full path to the Node.js binary
   - Check WSL is properly installed and running

## Development

To modify the server:

1. Edit `server.js` to change game mechanics or add new tools
2. Test locally with `node server.js`
3. Restart Claude Desktop to load changes

## Project Structure

```
Lemonade-Stand-MCP-Server/
├── server.js              # Main MCP server implementation
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## How It Works

This MCP server implements a simple game loop:

1. The server maintains game state in memory
2. Each tool represents a game action (buy, sell, etc.)
3. When Claude calls a tool, the server updates the game state
4. Results are returned to Claude as JSON
5. Claude analyzes the results and decides the next action

This demonstrates how MCP can be used to create interactive experiences where AI models can maintain state, make decisions, and interact with complex systems.

## Contributing

Feel free to open issues or submit pull requests if you have ideas for improvements or find bugs.

## License

MIT

---

**Built as an example of the Model Context Protocol in action.**
