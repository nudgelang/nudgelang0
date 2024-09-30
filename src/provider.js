// provider.js
require('openai/shims/node');
require('groq-sdk/shims/node');
require('@anthropic-ai/sdk/shims/node');

const OpenAI = require('openai');
const Groq = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');

class ProviderInterface {
  constructor() {
    this.apiKey = process.env.NUDGELANG_API_KEY;
    if (!this.apiKey) {
      throw new Error('API key not found in environment variables');
    }
  }

  async generateResponse(prompt, constraints) {
    throw new Error('Method not implemented');
  }
}

class OpenAIProvider extends ProviderInterface {
  constructor() {
    super();
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  async generateResponse(prompt, constraints) {
    const { maxTokens, temperature, topP, frequencyPenalty, presencePenalty, model } = constraints;
    
    const response = await this.client.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
    });

    return response.choices[0].message.content;
  }
}

class GroqProvider extends ProviderInterface {
  constructor() {
    super();
    this.client = new Groq({ apiKey: this.apiKey });
  }

  async generateResponse(prompt, constraints) {
    const { maxTokens, temperature, topP, model } = constraints;
    
    const response = await this.client.chat.completions.create({
      model: model || 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    });

    return response.choices[0].message.content;
  }
}

class ClaudeProvider extends ProviderInterface {
  constructor() {
    super();
    this.client = new Anthropic({ apiKey: this.apiKey });
  }

  async generateResponse(prompt, constraints) {
    const { maxTokens, temperature, topP, model } = constraints;
    
    const response = await this.client.completions.create({
      model: model || 'claude-3-opus-20240229',
      prompt: prompt,
      max_tokens_to_sample: maxTokens,
      temperature,
      top_p: topP,
    });

    return response.completion;
  }
}

function createProvider(type) {
  const providerType = type || process.env.NUDGELANG_PROVIDER || 'openai';
  
  switch (providerType.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider();
    case 'groq':
      return new GroqProvider();
    case 'claude':
      return new ClaudeProvider();
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
}

module.exports = {
  ProviderInterface,
  OpenAIProvider,
  GroqProvider,
  ClaudeProvider,
  createProvider,
};