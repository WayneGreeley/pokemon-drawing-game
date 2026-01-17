import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Environment variables
const BEDROCK_REGION = process.env.BEDROCK_REGION || 'us-east-1';
const MODEL_ID = 'amazon.nova-lite-v1:0';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
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
    
    // Invoke Bedrock InvokeModel API
    const result = await invokeBedrockModel(imageBuffer);
    
    // Parse and validate model response
    const recognitionResult = parseModelResponse(result);
    
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
 * Invoke Bedrock InvokeModel API for Pokémon identification
 * @param {Buffer} imageBuffer - Image data
 * @returns {Object} Model response
 */
async function invokeBedrockModel(imageBuffer) {
  try {
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Amazon Nova Lite InvokeModel format - corrected with proper schema
    const payload = {
      schemaVersion: "messages-v1",
      messages: [{
        role: "user",
        content: [{
          image: {
            format: "png",
            source: {
              bytes: base64Image
            }
          }
        }, {
          text: `You are a Pokémon identification expert. Analyze this hand-drawn image and identify which Pokémon was drawn.

Your response must be valid JSON with exactly these fields:
{
  "pokemonName": "Name of the identified Pokémon",
  "confidenceScore": 85,
  "explanation": "Detailed explanation of why you think this is the identified Pokémon, mentioning specific visual features like shape, colors, and distinctive characteristics."
}

Rules:
- confidenceScore must be a number between 0 and 100
- pokemonName should be the official Pokémon name (e.g., "Pikachu", "Charizard")
- explanation should be detailed and mention specific visual features
- If you're unsure, still provide your best guess but with a lower confidence score
- Only respond with the JSON object, no additional text`
        }]
      }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.7
      }
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(payload),
      contentType: "application/json",
      accept: "application/json"
    });
    
    console.log('Invoking Bedrock InvokeModel API');
    
    const response = await bedrockClient.send(command);
    
    console.log('Bedrock InvokeModel response received');
    
    return response;
  } catch (error) {
    console.error('Bedrock InvokeModel invocation failed:', error);
    throw new BedrockError(`Failed to invoke Bedrock model: ${error.message}`);
  }
}

/**
 * Parse and validate Bedrock InvokeModel response
 * @param {Object} modelResponse - Raw model response
 * @returns {Object} Parsed recognition result
 */
function parseModelResponse(modelResponse) {
  try {
    // Parse the response body
    const responseBody = JSON.parse(new TextDecoder().decode(modelResponse.body));
    
    console.log('Model response body:', responseBody);
    
    // Extract the content from Nova Lite's response format (corrected path)
    let responseText = null;
    
    // Nova Lite InvokeModel response format
    if (responseBody.output && responseBody.output.message && responseBody.output.message.content && 
        Array.isArray(responseBody.output.message.content) && responseBody.output.message.content.length > 0) {
      responseText = responseBody.output.message.content[0].text;
    }
    
    if (!responseText) {
      throw new BedrockError('No text content found in model response');
    }
    
    console.log('Model response text:', responseText);
    
    // Parse JSON response from the model
    const result = JSON.parse(responseText);
    
    // Validate response structure
    if (!result.pokemonName || typeof result.pokemonName !== 'string') {
      throw new BedrockError('Invalid pokemonName in model response');
    }
    
    if (typeof result.confidenceScore !== 'number' || 
        result.confidenceScore < 0 || 
        result.confidenceScore > 100) {
      throw new BedrockError('Invalid confidenceScore in model response');
    }
    
    if (!result.explanation || typeof result.explanation !== 'string') {
      throw new BedrockError('Invalid explanation in model response');
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
    console.error('Failed to parse model response:', error);
    throw new BedrockError('Failed to parse model response');
  }
}

/**
 * Create HTTP response (CORS headers handled by Function URL config)
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} Lambda response
 */
function createCorsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
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