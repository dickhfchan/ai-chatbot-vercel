import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// import { xai } from '@ai-sdk/xai';
import { azure } from '@ai-sdk/azure';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

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
        'chat-model': azure('gpt-4o'),
        'benjamin-graham': azure('gpt-4o'),
        'chat-model-reasoning': wrapLanguageModel({
          model: azure('gpt-4o'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': azure('gpt-4o'),
        'artifact-model': azure('gpt-4o'),
      },
    });
