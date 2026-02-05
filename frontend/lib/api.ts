import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============ Types ============

export interface FormGenerationRequest {
    prompt: string;
}

export interface FormGenerationResponse {
    form_url: string;
    form_id: string;
    title: string;
    created_at: string;
}

export interface AuthStatusResponse {
    authenticated: boolean;
    user_email?: string;
}

export interface FormHistoryItem {
    _id: string;
    user_email: string;
    form_id: string;
    form_url: string;
    form_title: string;
    prompt: string;
    created_at: string;
}

// ============ API Functions ============

export async function getAuthUrl(): Promise<string> {
    const response = await api.get('/api/auth/login');
    return response.data.auth_url;
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
    try {
        const response = await api.get('/api/auth/status');
        return response.data;
    } catch (error) {
        return { authenticated: false };
    }
}

export async function logout(): Promise<void> {
    await api.post('/api/auth/logout');
}

export async function generateForm(prompt: string): Promise<FormGenerationResponse> {
    const response = await api.post<FormGenerationResponse>('/api/generate', {
        prompt,
    });
    return response.data;
}

export interface UserStats {
    total_forms: number;
    total_responses: number;
    tokens_used: string;
}

export const getStats = async (): Promise<UserStats> => {
    const response = await api.get('/api/stats');
    return response.data;
};

export async function getHistory(skip: number = 0, limit: number = 20): Promise<FormHistoryItem[]> {
    const response = await api.get<FormHistoryItem[]>('/api/history', {
        params: { skip, limit },
    });
    return response.data;
}

// ============ Error Handling ============

export function getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.detail || error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
}

// ============ Settings API ============

export interface GeminiKeyStatus {
    is_set: boolean;
    default_available: boolean;
}

export async function saveGeminiKey(apiKey: string): Promise<void> {
    await api.post('/api/settings/gemini-key', { api_key: apiKey });
}

export async function getGeminiKeyStatus(): Promise<GeminiKeyStatus> {
    const response = await api.get<GeminiKeyStatus>('/api/settings/gemini-key');
    return response.data;
}
