import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

// Environment variables
const BEDROCK_REGION = process.env.BEDROCK_REGION || 'us-east-1';
const BEDROCK_AGENT_ID = process.env.BEDROCK_AGENT_ID;
const BEDROCK_AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID;

// Initialize Bedrock client
const bedrockClient = new BedrockAgentRuntimeClient({ 
  region: BEDROCK_REGION 
});

/**
 * Lambda handler for Function URL events
 * @param {Object} event - Lambda Function URL event
 * @returns {Object} HTTP response
 */
export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Handle CORS preflight requests
    if (event.requestContext?.http?.method === 'OPTIONS') {
      return createCorsResponse(200, { message: 'OK' });
    }
    
    // Validate HTTP method
    if (event.requestContext?.http?.method !== 'POST') {
      return createCorsResponse(405, { 
        error: 'MethodNotAllowed',
        message: 'Only POST method is allowed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Parse and validate request body
    const requestBody = parseRequestBody(event);
    if (!requestBody.image) {
      return createCorsResponse(400, {
        error: 'BadRequest',
        message: 'Missing required field: image',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate image data
    const imageBuffer = validateImageData(requestBody.image);
    
    // Generate unique session ID
    const sessionId = generateSessionId();
    
    // Invoke Bedrock Agent
    const result = await invokeBedrockAgent(imageBuffer, sessionId);
    
    // Parse and validate agent response
    const recognitionResult = parseAgentResponse(result);
    
    // Return successful response
    return createCorsResponse(200, {
      pokemonName: recognitionResult.pokemonName,
      confidenceScore: recognitionResult.confidenceScore,
      explanation: recognitionResult.explanation,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return appropriate error response
    if (error.name === 'ValidationError') {
      return createCorsResponse(400, {
        error: 'ValidationError',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.name === 'BedrockError') {
      return createCorsResponse(503, {
        error: 'ServiceUnavailable',
        message: 'AI service is temporarily unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generic server error
    return createCorsResponse(500, {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Parse request body from Lambda Function URL event
 * @param {Object} event - Lambda event
 * @returns {Object} Parsed request body
 */
function parseRequestBody(event) {
  try {
    if (!event.body) {
      throw new ValidationError('Request body is required');
    }
    
    // Handle base64 encoded body
    const bodyString = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    
    return JSON.parse(bodyString);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Validate and decode base64 image data
 * @param {string} base64Image - Base64 encoded image
 * @returns {Buffer} Image buffer
 */
function validateImageData(base64Image) {
  if (typeof base64Image !== 'string') {
    throw new ValidationError('Image data must be a string');
  }
  
  if (!base64Image.trim()) {
    throw new ValidationError('Image data cannot be empty');
  }
  
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Validate image size (max 1MB)
    if (imageBuffer.length > 1024 * 1024) {
      throw new ValidationError('Image size must be less than 1MB');
    }
    
    // Basic validation - check if it looks like image data
    if (imageBuffer.length < 100) {
      throw new ValidationError('Image data appears to be invalid or too small');
    }
    
    return imageBuffer;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid base64 image data');
  }
}

/**
 * Generate unique session ID for Bedrock Agent
 * @returns {string} Session ID
 */
function generateSessionId() {
  return `pokemon-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Invoke Bedrock Agent for Pokémon identification
 * @param {Buffer} imageBuffer - Image data
 * @param {string} sessionId - Session ID
 * @returns {Object} Agent response
 */
async function invokeBedrockAgent(imageBuffer, sessionId) {
  if (!BEDROCK_AGENT_ID || !BEDROCK_AGENT_ALIAS_ID) {
    throw new BedrockError('Bedrock Agent configuration is missing');
  }
  
  try {
    const command = new InvokeAgentCommand({
      agentId: BEDROCK_AGENT_ID,
      agentAliasId: BEDROCK_AGENT_ALIAS_ID,
      sessionId: sessionId,
      inputText: 'Please analyze this Pokémon drawing and identify which Pokémon it is.',
      // Note: Image data handling may need adjustment based on Bedrock Agent capabilities
      // This is a placeholder - actual implementation may require different approach
    });
    
    console.log('Invoking Bedrock Agent with session:', sessionId);
    
    const response = await bedrockClient.send(command);
    
    console.log('Bedrock Agent response received');
    
    return response;
  } catch (error) {
    console.error('Bedrock Agent invocation failed:', error);
    throw new BedrockError(`Failed to invoke Bedrock Agent: ${error.message}`);
  }
}

/**
 * Parse and validate Bedrock Agent response
 * @param {Object} agentResponse - Raw agent response
 * @returns {Object} Parsed recognition result
 */
function parseAgentResponse(agentResponse) {
  try {
    // Extract response text from Bedrock Agent response
    // Note: This may need adjustment based on actual response structure
    let responseText = '';
    
    if (agentResponse.completion) {
      responseText = agentResponse.completion;
    } else if (agentResponse.output && agentResponse.output.text) {
      responseText = agentResponse.output.text;
    } else {
      throw new BedrockError('Invalid response format from Bedrock Agent');
    }
    
    // Parse JSON response
    const result = JSON.parse(responseText);
    
    // Validate response structure
    if (!result.pokemonName || typeof result.pokemonName !== 'string') {
      throw new BedrockError('Invalid pokemonName in agent response');
    }
    
    if (typeof result.confidenceScore !== 'number' || 
        result.confidenceScore < 0 || 
        result.confidenceScore > 100) {
      throw new BedrockError('Invalid confidenceScore in agent response');
    }
    
    if (!result.explanation || typeof result.explanation !== 'string') {
      throw new BedrockError('Invalid explanation in agent response');
    }
    
    return {
      pokemonName: result.pokemonName.trim(),
      confidenceScore: Math.round(result.confidenceScore),
      explanation: result.explanation.trim()
    };
    
  } catch (error) {
    if (error instanceof BedrockError) {
      throw error;
    }
    console.error('Failed to parse agent response:', error);
    throw new BedrockError('Failed to parse agent response');
  }
}

/**
 * Create CORS-enabled HTTP response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} Lambda response
 */
function createCorsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Will be updated with specific domain
      'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '3600'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Custom error classes
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class BedrockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BedrockError';
  }
}