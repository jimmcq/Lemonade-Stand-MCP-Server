# Project Structure

This document explains the structure of the Lemonade Stand MCP server project.

## Files

```
Lemonade-Stand-MCP-Server/
├── server.js                           # Main MCP server implementation
├── package.json                        # Node.js dependencies
├── README.md                           # Project overview and setup guide
├── SETUP.md                            # Quick setup instructions
├── PROJECT_STRUCTURE.md                # This file
├── claude_desktop_config.example.json  # Example config for Claude Desktop
└── LICENSE                             # MIT license
```

## Key Components

### server.js
The heart of the project, containing:
- MCP server setup and initialization
- Game state management
- Tool implementations for game actions
- Business logic for the lemonade stand simulation

### package.json
Manages project dependencies:
- `@modelcontextprotocol/sdk`: MCP SDK for server implementation
- `uuid`: For generating unique game IDs

### Configuration Files
- `claude_desktop_config.example.json`: Template for users to copy and customize
- Various platform-specific examples in documentation

## Game Architecture

1. **State Management**: 
   - Game state is stored in memory using a Map
   - Each game has a unique ID
   - State includes day, money, inventory, weather, etc.

2. **Tools**:
   - `start_game`: Initializes new game state
   - `get_game_state`: Retrieves current state
   - `buy_supplies`: Handles inventory purchases
   - `set_price`: Sets lemonade price
   - `sell_lemonade`: Calculates sales and profits
   - `next_day`: Advances game time

3. **Game Mechanics**:
   - Weather generation (temperature + conditions)
   - Customer demand calculation
   - Price elasticity implementation
   - Inventory management with perishables
