export interface News {
  _id: string;
  title: string;
  content: string;
  category: string;
  image: string;
  author: {
    _id: string;
    name: string;
    role: 'admin' | 'client';
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  category: string;
  image: string;
}

export interface UpdateNewsRequest {
  title: string;
  content: string;
  category: string;
  image: string;
}

export interface NewsResponse {
  success: boolean;
  data: News[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
