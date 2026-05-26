export interface DiaryCreate {
  name: string;
}

export interface DiaryRead {
  id: number;
  name: string;
}

export interface PageCreate {
  content: string;
}

export interface PageRead {
  id: number;
  created_at: string;
  content: string;
}
