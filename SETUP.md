# Setup Guide

## Quick Setup

If you just want to get the server running quickly:

1. **Clone and Install**:
   ```bash
   git clone https://github.com/yourusername/Lemonade-Stand-MCP-Server.git
   cd Lemonade-Stand-MCP-Server
   npm install
   ```

2. **Create Claude Desktop Config**:
   
   On macOS:
   ```bash
   mkdir -p ~/Library/"Application Support"/Claude
   cat > ~/Library/"Application Support"/Claude/claude_desktop_config.json << EOF
   {
     "mcpServers": {
       "lemonade-stand": {
         "command": "node",
         "args": ["$(pwd)/server.js"]
       }
     }
   }
   EOF
   ```

   On Windows (PowerShell):
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"
   $serverPath = (Get-Location).Path + "\server.js"
   @"
   {
     "mcpServers": {
       "lemonade-stand": {
         "command": "node",
         "args": ["$serverPath"]
       }
     }
   }
   "@ | Out-File -Encoding UTF8 "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

3. **Restart Claude Desktop**

4. **Test the Connection**:
   - Look for the hammer icon in Claude Desktop
   - Start a new chat and type: "Play a game of Lemonade Stand"

That's it! You're ready to play.

## Troubleshooting

If you don't see the hammer icon:
1. Check that Claude Desktop is fully restarted
2. Verify Node.js is installed by running `node --version`
3. Check the logs in Claude Desktop's settings
