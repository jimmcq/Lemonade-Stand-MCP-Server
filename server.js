#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ErrorCode, 
  ListToolsRequestSchema, 
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

console.error("Initializing Lemonade Stand MCP server");

// Create server
const server = new Server(
  {
    name: 'lemonade-stand',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

// Game state
const games = new Map();

// Generate weather
const generateWeather = () => {
  const temp = Math.floor(Math.random() * 40) + 50; // 50-90°F
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  return { temp, condition };
};

// Create new game
const createNewGame = () => ({
  day: 1,
  money: 20.00,
  inventory: {
    cups: 0,
    lemons: 0,
    sugar: 0,
    ice: 0
  },
  costPerCup: 0,
  pricePerCup: 0.25,
  weather: generateWeather(),
  status: 'buying'
});

// Handle buy supplies
const handleBuySupplies = (gameState, purchases) => {
  const prices = {
    cups: 0.05,
    lemons: 0.10,
    sugar: 0.08,
    ice: 0.02
  };

  let totalCost = 0;
  const newInventory = { ...gameState.inventory };
  
  for (const item of ['cups', 'lemons', 'sugar', 'ice']) {
    const amount = purchases[item] || 0;
    totalCost += amount * prices[item];
    newInventory[item] += amount;
  }

  if (totalCost > gameState.money) {
    return { success: false, message: "Not enough money!" };
  }

  return {
    success: true,
    gameState: {
      ...gameState,
      money: gameState.money - totalCost,
      inventory: newInventory,
      costPerCup: totalCost / Math.max(1, purchases.cups || 0),
      status: 'pricing'
    }
  };
};

// Calculate potential customers
const calculatePotentialCustomers = (weather, price) => {
  let customers = Math.floor(weather.temp / 3);
  
  if (weather.condition === 'Sunny') customers += 15;
  if (weather.condition === 'Partly Cloudy') customers += 10;
  if (weather.condition === 'Cloudy') customers += 5;
  if (weather.condition === 'Rainy') customers -= 10;

  // Price elasticity
  if (price <= 0.15) customers += 10;
  if (price > 0.50) customers -= Math.floor((price - 0.50) * 30);
  
  return Math.max(0, customers);
};

// Make recipe
const makeRecipe = (gameState) => {
  const cupsPerPitcher = 10;
  const lemonsPerPitcher = 4;
  const sugarPerPitcher = 4;
  const icePerPitcher = 15;
  
  const possiblePitchers = Math.min(
    Math.floor(gameState.inventory.lemons / lemonsPerPitcher),
    Math.floor(gameState.inventory.sugar / sugarPerPitcher),
    Math.floor(gameState.inventory.ice / icePerPitcher)
  );
  
  const maxCups = Math.min(
    possiblePitchers * cupsPerPitcher,
    gameState.inventory.cups
  );
  
  return {
    maxCups,
    lemonsUsed: Math.floor((maxCups / cupsPerPitcher) * lemonsPerPitcher),
    sugarUsed: Math.floor((maxCups / cupsPerPitcher) * sugarPerPitcher),
    iceUsed: Math.floor((maxCups / cupsPerPitcher) * icePerPitcher)
  };
};

// Handle sell lemonade
const handleSellLemonade = (gameState) => {
  const recipe = makeRecipe(gameState);
  const potentialCustomers = calculatePotentialCustomers(gameState.weather, gameState.pricePerCup);
  const actualSales = Math.min(potentialCustomers, recipe.maxCups);
  
  const revenue = actualSales * gameState.pricePerCup;
  const newInventory = {
    cups: gameState.inventory.cups - actualSales,
    lemons: gameState.inventory.lemons - recipe.lemonsUsed,
    sugar: gameState.inventory.sugar - recipe.sugarUsed,
    ice: 0 // ice melts every day
  };

  const dailyProfit = revenue - (gameState.costPerCup * actualSales);
  
  return {
    success: true,
    dailyResults: {
      sales: actualSales,
      revenue: revenue,
      profit: dailyProfit,
      potentialCustomers: potentialCustomers,
      unsatisfiedCustomers: Math.max(0, potentialCustomers - actualSales)
    },
    gameState: {
      ...gameState,
      money: gameState.money + revenue,
      inventory: newInventory,
      status: 'reporting'
    }
  };
};

// Handle next day
const handleNextDay = (gameState) => {
  if (gameState.day >= 14) {
    return {
      success: true,
      gameState: {
        ...gameState,
        status: 'gameOver'
      }
    };
  }

  return {
    success: true,
    gameState: {
      ...gameState,
      day: gameState.day + 1,
      weather: generateWeather(),
      status: 'buying',
      inventory: {
        ...gameState.inventory,
        ice: 0 // ice melts daily
      }
    }
  };
};

// Set up tools - only actions that modify state
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Listing tools');
  return {
    tools: [
      {
        name: "start_game",
        description: "Start a new lemonade stand game",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "buy_supplies",
        description: "Purchase supplies for the lemonade stand",
        inputSchema: {
          type: "object",
          properties: {
            gameId: { type: "string", description: "The game ID" },
            cups: { type: "number", description: "Number of cups to buy" },
            lemons: { type: "number", description: "Number of lemons to buy" },
            sugar: { type: "number", description: "Amount of sugar to buy" },
            ice: { type: "number", description: "Amount of ice to buy" }
          },
          required: ["gameId"]
        }
      },
      {
        name: "set_price",
        description: "Set the price per cup of lemonade",
        inputSchema: {
          type: "object",
          properties: {
            gameId: { type: "string", description: "The game ID" },
            price: { type: "number", description: "Price per cup in dollars" }
          },
          required: ["gameId", "price"]
        }
      },
      {
        name: "sell_lemonade",
        description: "Open for business and see today's results",
        inputSchema: {
          type: "object",
          properties: {
            gameId: { type: "string", description: "The game ID" }
          },
          required: ["gameId"]
        }
      },
      {
        name: "next_day",
        description: "Advance to the next day",
        inputSchema: {
          type: "object",
          properties: {
            gameId: { type: "string", description: "The game ID" }
          },
          required: ["gameId"]
        }
      }
    ]
  };
});

// Handle tool calls - only actions that modify state
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`Tool call received: ${request.params.name}`);
  
  switch (request.params.name) {
    case 'start_game': {
      const gameId = uuidv4();
      const initialGameState = createNewGame();
      games.set(gameId, initialGameState);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ gameId, gameState: initialGameState })
        }]
      };
    }
    
    case 'buy_supplies': {
      const buyGame = games.get(request.params.arguments?.gameId);
      if (!buyGame) {
        throw new McpError(ErrorCode.InvalidRequest, "Game not found");
      }
      
      const result = handleBuySupplies(buyGame, request.params.arguments);
      if (result.success) {
        games.set(request.params.arguments.gameId, result.gameState);
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result)
        }]
      };
    }
    
    case 'set_price': {
      const priceGame = games.get(request.params.arguments?.gameId);
      if (!priceGame) {
        throw new McpError(ErrorCode.InvalidRequest, "Game not found");
      }
      
      priceGame.pricePerCup = parseFloat(request.params.arguments.price);
      priceGame.status = 'selling';
      games.set(request.params.arguments.gameId, priceGame);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: true, gameState: priceGame })
        }]
      };
    }
    
    case 'sell_lemonade': {
      const sellGame = games.get(request.params.arguments?.gameId);
      if (!sellGame) {
        throw new McpError(ErrorCode.InvalidRequest, "Game not found");
      }
      
      const sellResult = handleSellLemonade(sellGame);
      if (sellResult.success) {
        games.set(request.params.arguments.gameId, sellResult.gameState);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(sellResult)
        }]
      };
    }
    
    case 'next_day': {
      const nextDayGame = games.get(request.params.arguments?.gameId);
      if (!nextDayGame) {
        throw new McpError(ErrorCode.InvalidRequest, "Game not found");
      }
      
      const nextDayResult = handleNextDay(nextDayGame);
      if (nextDayResult.success) {
        games.set(request.params.arguments.gameId, nextDayResult.gameState);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(nextDayResult)
        }]
      };
    }
    
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

// Set up resources - read-only data access
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.error('Listing resources');
  const resources = [];
  
  // Add a resource for each active game
  for (const [gameId, gameState] of games.entries()) {
    resources.push({
      uri: `game://${gameId}`,
      name: `Game ${gameId}`,
      description: `Game state for Day ${gameState.day}, $${gameState.money.toFixed(2)} balance`,
      mimeType: "application/json"
    });
  }
  
  return { resources };
});

// Handle resource reading - for reading game state
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.error(`Reading resource: ${request.params.uri}`);
  
  const gameMatch = request.params.uri.match(/^game:\/\/(.+)$/);
  if (gameMatch) {
    const gameId = gameMatch[1];
    const gameState = games.get(gameId);
    
    if (!gameState) {
      throw new McpError(ErrorCode.InvalidRequest, "Game not found");
    }
    
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify({ gameState }, null, 2)
      }]
    };
  }
  
  throw new McpError(ErrorCode.InvalidRequest, "Unknown resource URI");
});

// Set up prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  console.error('Listing prompts');
  return {
    prompts: [
      {
        name: "start_lemonade_game",
        description: "Start a new Lemonade Stand game with an introduction",
        arguments: []
      }
    ]
  };
});

// Handle prompt retrieval
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  console.error(`Getting prompt: ${request.params.name}`);
  
  if (request.params.name === "start_lemonade_game") {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "I want to play the Lemonade Stand game."
          }
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Welcome to Lemonade Stand Tycoon! 🍋

You're about to embark on a 14-day journey to build your lemonade empire. Your goal is to make as much profit as possible by:
1. Buying supplies wisely
2. Setting the right price for your lemonade
3. Responding to weather conditions

You start with $20. Each day, you'll need to:
- Check the weather forecast
- Buy cups, lemons, sugar, and ice
- Set your lemonade price
- See how many customers you attract

Remember: Ice melts daily, so buy just what you need!

Let me start a new game for you...`
          }
        }
      ]
    };
  }
  
  throw new McpError(ErrorCode.InvalidRequest, "Unknown prompt");
});

// Main execution
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("Lemonade Stand MCP server running on stdio");
}).catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});