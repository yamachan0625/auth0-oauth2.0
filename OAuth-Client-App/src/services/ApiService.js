class ApiService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = process.env.REACT_APP_API_SERVER_URL || "http://localhost:3001";
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API呼び出しエラー (${endpoint}):`, error);
      throw error;
    }
  }

  // 基本的なAPI呼び出し
  async callExternalApi() {
    return this.makeRequest("/api/external");
  }

  // 現在のユーザー情報を取得
  async getCurrentUser() {
    return this.makeRequest("/api/v1/me");
  }

  // 詳細なプロファイル情報を取得
  async getUserProfile() {
    return this.makeRequest("/api/v1/profile");
  }

  // カスタムエンドポイント呼び出し
  async callCustomEndpoint(endpoint, method = "GET", body = null) {
    const options = {
      method,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    return this.makeRequest(endpoint, options);
  }
}

export default ApiService;