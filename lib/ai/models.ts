export const DEFAULT_CHAT_MODEL: string = 'benjamin-graham';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  // {
  //   id: 'chat-model',
  //   name: 'Chat model',
  //   description: 'Primary model for all-purpose chat',
  // },
  // {
  //   id: 'chat-model-reasoning',
  //   name: 'Reasoning model',
  //   description: 'Uses advanced reasoning',
  // },
  {
    id: 'benjamin-graham',
    name: 'Benjamin Graham agent',
    description: 'Uses Benjamin Graham principles',
  },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett agent',
    description: 'Uses Warren Buffett principles',
  },
  {
    id: 'cathie-wood',
    name: 'Cathie Wood agent',
    description: 'Uses Cathie Wood principles',
  },
  {
    id: 'charlie-munger',
    name: 'Charlie Munger agent',
    description: 'Uses Charlie Munger principles',
  },
  {
    id: 'michael-burry',
    name: 'Michael Burry agent',
    description: 'Uses Michael Burry principles',
  },
  {
    id: 'peter-lynch',
    name: 'Peter Lynch agent',
    description: 'Uses Peter Lynch principles',
  },
  {
    id: 'phil-fisher',
    name: 'Phil Fisher agent',
    description: 'Uses Phil Fisher principles',
  },
  {
    id: 'stanley-druckenmiller',
    name: 'Stanley Druckenmiller agent',
    description: 'Uses Stanley Druckenmiller principles',
  },
  

];
