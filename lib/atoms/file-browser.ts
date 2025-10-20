import { atom } from "jotai";

type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

type FileChange = {
  filename: string;
  status: FileChangeStatus;
  additions: number;
  deletions: number;
  changes: number;
};

type FileTreeNode = {
  type: "file" | "directory";
  filename?: string;
  status?: string;
  additions?: number;
  deletions?: number;
  changes?: number;
  children?: Record<string, FileTreeNode>;
};

type ViewModeKey = "local" | "remote" | "all" | "all-local";

type ViewModeData = {
  files: FileChange[];
  fileTree: Record<string, FileTreeNode>;
  expandedFolders: Set<string>;
  fetchAttempted: boolean;
  error: string | null;
};

type FileBrowserState = Record<ViewModeKey, ViewModeData> & {
  loading: boolean;
  error: string | null;
};

function cloneViewModeData(): ViewModeData {
  return {
    files: [],
    fileTree: {},
    expandedFolders: new Set<string>(),
    fetchAttempted: false,
    error: null,
  };
}

function createDefaultState(): FileBrowserState {
  return {
    local: cloneViewModeData(),
    remote: cloneViewModeData(),
    all: cloneViewModeData(),
    "all-local": cloneViewModeData(),
    loading: false,
    error: null,
  };
}

// Create a separate atom for each task's file browser state
export const fileBrowserStateFamily = atom<Record<string, FileBrowserState>>({});

function getDefaultState(): FileBrowserState {
  return createDefaultState();
}

// Helper to get state for a specific task
export const getTaskFileBrowserState = (taskId: string) =>
  atom(
    (get) => {
      const allStates = get(fileBrowserStateFamily);
      return allStates[taskId] ?? getDefaultState();
    },
    (get, set, update: Partial<FileBrowserState>) => {
      const allStates = get(fileBrowserStateFamily);
      const currentState = allStates[taskId] ?? getDefaultState();
      set(fileBrowserStateFamily, {
        ...allStates,
        [taskId]: { ...currentState, ...update },
      });
    }
  );
