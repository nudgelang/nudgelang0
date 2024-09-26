// provider.js
const OpenAI = require('openai');
const Groq = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');

class ProviderInterface {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt, constraints) {
    throw new Error('Method not implemented');
  }
}

class OpenAIProvider extends ProviderInterface {
  constructor(apiKey) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
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
  constructor(apiKey) {
    super(apiKey);
    this.client = new Groq({ apiKey });
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
  constructor(apiKey) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
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

function createProvider(type, apiKey) {
  switch (type.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'groq':
      return new GroqProvider(apiKey);
    case 'claude':
      return new ClaudeProvider(apiKey);
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

module.exports = {
  ProviderInterface,
  OpenAIProvider,
  GroqProvider,
  ClaudeProvider,
  createProvider,
};