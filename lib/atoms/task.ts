import { atomWithStorage } from "jotai/utils";
import { atomFamily } from "jotai/utils";

export const taskPromptAtom = atomWithStorage<string>("task-prompt", "");

export const taskChatInputAtomFamily = atomFamily((taskId: string) =>
  atomWithStorage<string>(`task-chat-input-${taskId}`, "")
);
