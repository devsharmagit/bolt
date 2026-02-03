/**
 * Message in the chat/LLM history.
 * - User-typed messages (e.g. "make a todo app") should have displayInChat: true or omitted.
 * - Injected prompts (template/system prompts from prompt.ts / template action) should have displayInChat: false
 *   so they are sent to the LLM but not shown in the chat UI.
 */
export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
  /** If false, message is used for LLM context only and not shown in the chat box. Default true. */
  displayInChat?: boolean;
  /** @deprecated Use displayInChat instead. Kept for compatibility. */
  default?: boolean;
}