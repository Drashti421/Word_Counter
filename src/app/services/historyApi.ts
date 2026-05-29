export interface HistoryApiItem {
  id: string;
  text: string;
  timestamp: string;
  wordCount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
};

export const getHistory = async (): Promise<HistoryApiItem[]> => {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    credentials: "include",
  });
  return parseResponse<HistoryApiItem[]>(response);
};

export const createHistoryItem = async (text: string, wordCount: number): Promise<HistoryApiItem> => {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ text, wordCount }),
  });
  return parseResponse<HistoryApiItem>(response);
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed with ${response.status}`);
  }
};

export const clearHistory = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Clear failed with ${response.status}`);
  }
};
