import { create } from "zustand";

interface PracticeSessionState {
  activeTaskId: string | null;
  draftAnswer: string;
  hintsUsedCount: number;
  isChatOpen: boolean;
  taskStartedAt: number | null;
  setActiveTask: (taskId: string) => void;
  setDraftAnswer: (value: string) => void;
  incrementHintsUsed: () => void;
  toggleChat: (open?: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeTaskId: null,
  draftAnswer: "",
  hintsUsedCount: 0,
  isChatOpen: true,
  taskStartedAt: null,
} satisfies Omit<PracticeSessionState, "setActiveTask" | "setDraftAnswer" | "incrementHintsUsed" | "toggleChat" | "reset">;

export const usePracticeSessionStore = create<PracticeSessionState>((set) => ({
  ...initialState,
  setActiveTask: (taskId) => set({ activeTaskId: taskId, draftAnswer: "", hintsUsedCount: 0, taskStartedAt: Date.now() }),
  setDraftAnswer: (value) => set({ draftAnswer: value }),
  incrementHintsUsed: () => set((state) => ({ hintsUsedCount: state.hintsUsedCount + 1 })),
  toggleChat: (open) => set((state) => ({ isChatOpen: open ?? !state.isChatOpen })),
  reset: () => set(initialState),
}));
