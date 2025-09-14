import { createMutationHook, createQueryHook } from "@/hooks/use-query";
import { threadKeys } from "./keys";
import { addUserMessage, getMessages, createMessage, CreateMessageRequest } from "@/lib/api";

export const useMessagesQuery = (threadId: string) =>
  createQueryHook(
    threadKeys.messages(threadId),
    () => getMessages(threadId),
    {
      enabled: !!threadId,
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )();

export const useAddUserMessageMutation = () =>
  createMutationHook(
    ({
      threadId,
      message,
    }: {
      threadId: string;
      message: string;
    }) => addUserMessage(threadId, message)
  )();

// New generic create message mutation (uses backend endpoint for retry logic & idempotency)
export const useCreateMessageMutation = () =>
  createMutationHook(
    ({ threadId, req }: { threadId: string; req: CreateMessageRequest }) =>
      createMessage(threadId, req)
  )();
