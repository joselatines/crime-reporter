interface APIResponse {
  data: any;
  message: string;
  success: boolean;
}

export class APIService {
  private baseUrl: string;
  private newsUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:5000/api/v1';
    this.newsUrl = `${this.baseUrl}/news`;
  }

  public async getNews(): Promise<APIResponse> {
    try {
      const res = await fetch(this.newsUrl);
      const data: APIResponse = await res.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new APIService();
