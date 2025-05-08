import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// import { xai } from '@ai-sdk/xai';
import { azure } from '@ai-sdk/azure';
// import { groq } from '@ai-sdk/groq';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';


const llmProvider = azure('gpt-4o')

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': llmProvider,
        'benjamin-graham': llmProvider,
        'warren-buffett': llmProvider,
        'cathie-wood': llmProvider,
        'charlie-munger': llmProvider,
        'michael-burry': llmProvider,
        'peter-lynch': llmProvider,
        'phil-fisher': llmProvider,
        'stanley-druckenmiller': llmProvider, 
        'chat-model-reasoning': wrapLanguageModel({
          model: llmProvider,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': llmProvider,
        'artifact-model': llmProvider,
      },
    });
