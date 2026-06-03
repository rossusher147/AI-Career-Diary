export interface DiaryCreate {
  name: string;
}

export interface DiaryRead {
  id: number;
  name: string;
}

export interface PageCreate {
  content: string;
  created_at: string;
}

export interface PageUpdate {
  content: string;
  created_at: string;
}

export interface PageRead {
  id: number;
  created_at: string;
  content: string;
}
