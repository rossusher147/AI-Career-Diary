import { appConfig } from "../config";
import type { DiaryCreate, DiaryRead, PageCreate, PageRead, PageUpdate } from "./types";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type TokenProvider = () => Promise<string | undefined>;

async function request<T>(
  path: string,
  getToken: TokenProvider,
  init: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new ApiError(response.status, userSafeErrorMessage(response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function userSafeErrorMessage(status: number): string {
  if (status === 401) {
    return "Please sign in to continue.";
  }

  if (status === 404) {
    return "We couldn't find that diary.";
  }

  return "Something went wrong. Please try again.";
}

export function createDiaryApi(getToken: TokenProvider) {
  if (appConfig.mockApiEnabled) {
    return createMockDiaryApi();
  }

  return {
    getDiaries: () => request<DiaryRead[]>("/diaries", getToken),
    createDiary: (diary: DiaryCreate) =>
      request<DiaryRead>("/diaries", getToken, {
        method: "POST",
        body: JSON.stringify(diary)
      }),
    getPages: (diaryId: number) =>
      request<PageRead[]>(`/diaries/${diaryId}/pages`, getToken),
    createPage: (diaryId: number, page: PageCreate) =>
      request<PageRead>(`/diaries/${diaryId}/pages`, getToken, {
        method: "POST",
        body: JSON.stringify(page)
      }),
    updatePage: (diaryId: number, pageId: number, page: PageUpdate) =>
      request<PageRead>(`/diaries/${diaryId}/pages/${pageId}`, getToken, {
        method: "PUT",
        body: JSON.stringify(page)
      })
  };
}

function createMockDiaryApi() {
  const storageKey = "aicd.mock-api";

  interface MockState {
    diaries: DiaryRead[];
    pagesByDiaryId: Record<string, PageRead[]>;
  }

  function readState(): MockState {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return { diaries: [], pagesByDiaryId: {} };
    }

    try {
      return JSON.parse(stored) as MockState;
    } catch {
      return { diaries: [], pagesByDiaryId: {} };
    }
  }

  function writeState(state: MockState) {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  return {
    async getDiaries() {
      return readState().diaries;
    },
    async createDiary(diary: DiaryCreate) {
      const state = readState();
      const created: DiaryRead = {
        id: Date.now(),
        name: diary.name
      };

      writeState({
        ...state,
        diaries: [...state.diaries, created],
        pagesByDiaryId: {
          ...state.pagesByDiaryId,
          [created.id]: []
        }
      });

      return created;
    },
    async getPages(diaryId: number) {
      const state = readState();
      const diaryExists = state.diaries.some((diary) => diary.id === diaryId);

      if (!diaryExists) {
        throw new ApiError(404, "We couldn't find that diary.");
      }

      return sortPagesByDate(state.pagesByDiaryId[String(diaryId)] ?? []);
    },
    async createPage(diaryId: number, page: PageCreate) {
      const state = readState();
      const diaryExists = state.diaries.some((diary) => diary.id === diaryId);

      if (!diaryExists) {
        throw new ApiError(404, "We couldn't find that diary.");
      }

      const existingPages = state.pagesByDiaryId[String(diaryId)] ?? [];
      const pageDate = toUtcDateValue(page.created_at);
      const duplicatePage = existingPages.some((existingPage) => toUtcDateValue(existingPage.created_at) === pageDate);

      if (duplicatePage) {
        throw new ApiError(409, "A page already exists for this date.");
      }

      const created: PageRead = {
        id: Date.now(),
        created_at: page.created_at,
        content: page.content
      };

      writeState({
        ...state,
        pagesByDiaryId: {
          ...state.pagesByDiaryId,
          [diaryId]: [...(state.pagesByDiaryId[String(diaryId)] ?? []), created]
        }
      });

      return created;
    },
    async updatePage(diaryId: number, pageId: number, page: PageUpdate) {
      const state = readState();
      const pages = state.pagesByDiaryId[String(diaryId)] ?? [];
      const pageIndex = pages.findIndex((p) => p.id === pageId);

      if (pageIndex === -1) {
        throw new ApiError(404, "We couldn't find that page.");
      }

      const pageDate = toUtcDateValue(page.created_at);
      const duplicatePage = pages.some(
        (existingPage) => existingPage.id !== pageId && toUtcDateValue(existingPage.created_at) === pageDate
      );

      if (duplicatePage) {
        throw new ApiError(409, "A page already exists for this date.");
      }

      const updated: PageRead = {
        id: pageId,
        created_at: page.created_at,
        content: page.content
      };

      pages[pageIndex] = updated;

      writeState({
        ...state,
        pagesByDiaryId: {
          ...state.pagesByDiaryId,
          [diaryId]: pages
        }
      });

      return updated;
    }
  };
}

function toUtcDateValue(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

function sortPagesByDate(pages: PageRead[]) {
  return [...pages].sort((leftPage, rightPage) => {
    const leftTime = new Date(leftPage.created_at).getTime();
    const rightTime = new Date(rightPage.created_at).getTime();
    const timeDifference =
      (Number.isNaN(leftTime) ? Number.MAX_SAFE_INTEGER : leftTime) -
      (Number.isNaN(rightTime) ? Number.MAX_SAFE_INTEGER : rightTime);

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return leftPage.id - rightPage.id;
  });
}
