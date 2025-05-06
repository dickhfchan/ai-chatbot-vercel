import {
  appendClientMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
  experimental_createMCPClient,
} from 'ai'; // Import the experimental_createMCPClient
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio'; // Import the experimental_StdioMCPTransport
import { auth, type UserType } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import dotenv from 'dotenv';

export const maxDuration = 60;

export async function POST(request: Request) {

  // get the firecrawl api key from the environment variables
  dotenv.config();
  let clientOne;
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  const transport = new Experimental_StdioMCPTransport({
    command: 'npx',
    args: ["-y", "firecrawl-mcp"],
    env:{
        "FIRECRAWL_API_KEY": FIRECRAWL_API_KEY ?? ''
      }
  });
  clientOne = await experimental_createMCPClient({
    transport,
  });

  const toolSetOne = await clientOne.tools();

  // "financial-datasets": {
  //   "command": "/Users/dickchan/.local/bin/uv",
  //   "args": [
  //     "--directory",
  //     "/Users/dickchan/projects/mcp-server-main",
  //     "run",
  //     "server.py"
  //   ]
  // },
  // Set the financial-datasets tool
//   "amap-maps": {
//     "command": "npx",
//     "args": [
//         "-y",
//         "@amap/amap-maps-mcp-server"
//     ],
//     "env": {
//         "AMAP_MAPS_API_KEY": "f98157afed309f77140e0e5a8b365f7f"
//     }
// },
  const transport2 = new Experimental_StdioMCPTransport({
    // Get the financial-datasets tool
    command: "/home/ubuntu/.local/bin/uv",
    args: ["--directory", "/home/ubuntu/financial_data_mcp", "run", "server.py"],
    // env: {
    //   "AMAP_MAPS_API_KEY": "f98157afed309f77140e0e5a8b365f7f"
    // }
  });
  const clientTwo = await experimental_createMCPClient({
    transport: transport2,
  });

  const toolSetTwo = await clientTwo.tools();
  
  
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    // console.log(json);
    requestBody = postRequestBodySchema.parse(json);
    // console.log(requestBody);
  } catch (_) {
    return new Response('Invalid request body', { status: 400 });
  }

  try {
    const { id, message, selectedChatModel } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        'You have exceeded your maximum number of messages for the day! Please try again later.',
        {
          status: 429,
        },
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // console.log(selectedChatModel);
    // console.log(systemPrompt({ selectedChatModel }));
    // console.log(myProvider.languageModel(selectedChatModel));

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 30,
          // experimental_activeTools:
          //   selectedChatModel === 'chat-model-reasoning'
          //     ? []
          //     : [
          //         'getWeather',
          //         'toolSetOne',
          //         'createDocument',
          //         'updateDocument',
          //         'requestSuggestions',
          //       ],
          // experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            ...toolSetOne,
            ...toolSetTwo,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        // console.log(result);
        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        // print the error
        // console.error('Error');
        return 'Oops, an error occurred!';
      },
    });
  } catch (_) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
