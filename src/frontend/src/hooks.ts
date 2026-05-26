import { useMemo } from "react";
import { createDiaryApi } from "./api/client";
import { useAuth } from "./auth/AuthProvider";

export function useDiaryApi() {
  const { getToken } = useAuth();

  return useMemo(() => createDiaryApi(getToken), [getToken]);
}
