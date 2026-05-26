import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthGate } from "./components/AuthGate";
import { CreateDiaryPage } from "./pages/CreateDiaryPage";
import { CreatePagePage } from "./pages/CreatePagePage";
import { DiaryDetailPage } from "./pages/DiaryDetailPage";
import { DiaryListPage } from "./pages/DiaryListPage";

export function App() {
  return (
    <AuthGate>
      <AppShell>
        <Routes>
          <Route element={<Navigate replace to="/diaries" />} path="/" />
          <Route element={<DiaryListPage />} path="/diaries" />
          <Route element={<CreateDiaryPage />} path="/diaries/new" />
          <Route element={<DiaryDetailPage />} path="/diaries/:diaryId" />
          <Route element={<CreatePagePage />} path="/diaries/:diaryId/pages/new" />
          <Route element={<Navigate replace to="/diaries" />} path="*" />
        </Routes>
      </AppShell>
    </AuthGate>
  );
}
