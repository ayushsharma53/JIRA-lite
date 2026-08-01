import { create } from "zustand";
import type { Task } from "../types";

interface UiState {
  darkMode: boolean;
  commandOpen: boolean;
  selectedTask?: Task;
  toggleDarkMode: () => void;
  setCommandOpen: (open: boolean) => void;
  setSelectedTask: (task?: Task) => void;
}

export const useUiStore = create<UiState>(set => ({
  darkMode: false,
  commandOpen: false,
  selectedTask: undefined,
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
  setCommandOpen: commandOpen => set({ commandOpen }),
  setSelectedTask: selectedTask => set({ selectedTask })
}));
