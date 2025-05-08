import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import 'dotenv/config';

(async () => {
  // Get the api key of groq
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  } else {
    console.log('GROQ_API_KEY:', apiKey);
  }

  const { text } = await generateText({
    model: groq('mixtral-8x7b-32768'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  console.log(text);
})();