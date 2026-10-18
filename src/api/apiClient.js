import axios from 'axios';

// Connection to FastAPI Backend
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  me: async () => {
    try {
      return (await apiClient.get('/auth/me')).data;
    } catch {
      return null;
    }
  },
  loginViaEmailPassword: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    return res.data;
  },
  register: async (data) => (await apiClient.post('/auth/register', data)).data,
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
  updateMe: async (data) => (await apiClient.put('/auth/me', data)).data,
  changePassword: async (oldPass, newPass) => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true };
  },
  redirectToLogin: () => window.location.href = '/login',
  loginWithProvider: async (provider, returnTo) => {
    if (provider === 'google') {
      try {
        const res = await apiClient.post('/auth/mock-google');
        localStorage.setItem('token', res.data.access_token);
        window.location.href = returnTo || '/';
      } catch (e) {
        console.error("Mock Google login failed", e);
      }
    }
  }
};

const makeEntity = (methods) => new Proxy(methods, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return async () => [];
  }
});

export const entities = new Proxy({
  Crop: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/crops')).data; } catch { return []; }
    },
    get: async (id) => {
      try { return (await apiClient.get(`/crops/${id}`)).data; } catch { return null; }
    },
    create: async (data) => (await apiClient.post('/crops', data)).data,
    update: async (id, data) => (await apiClient.put(`/crops/${id}`, data)).data,
    delete: async (id) => (await apiClient.delete(`/crops/${id}`)).data,
  }),
  Diagnosis: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/diagnoses')).data; } catch { return []; }
    },
    get: async (id) => (await apiClient.get(`/diagnoses/${id}`)).data,
    create: async (data) => (await apiClient.post('/diagnoses', data)).data,
    delete: async (id) => (await apiClient.delete(`/diagnoses/${id}`)).data,
  }),
  Notification: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/notifications')).data; } catch { return []; }
    },
    update: async (id, data) => (await apiClient.put(`/notifications/${id}`, data)).data,
    delete: async (id) => (await apiClient.delete(`/notifications/${id}`)).data,
  }),
  Reminder: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/reminders')).data; } catch { return []; }
    },
    filter: async (params, sort, limit) => {
      try { return (await apiClient.get('/reminders')).data; } catch { return []; }
    },
    create: async (data) => (await apiClient.post('/reminders', data)).data,
    update: async (id, data) => (await apiClient.put(`/reminders/${id}`, data)).data,
    delete: async (id) => (await apiClient.delete(`/reminders/${id}`)).data,
  }),
  Disease: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/diseases')).data; } catch { return []; }
    },
    get: async (id) => (await apiClient.get(`/diseases/${id}`)).data,
    create: async (data) => (await apiClient.post('/diseases', data)).data,
    update: async (id, data) => (await apiClient.put(`/diseases/${id}`, data)).data,
    delete: async (id) => (await apiClient.delete(`/diseases/${id}`)).data,
  }),
  ExpertProfile: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/experts')).data; } catch { return []; }
    }
  }),
  ExpertReview: makeEntity({
    list: async () => {
      try { return (await apiClient.get('/experts/reviews')).data; } catch { return []; }
    },
    get: async (id) => (await apiClient.get(`/experts/reviews/${id}`)).data,
    create: async (data) => (await apiClient.post('/experts/reviews', data)).data,
    update: async (id, data) => (await apiClient.put(`/experts/reviews/${id}`, data)).data,
  })
}, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return makeEntity({});
  }
});

export const integrations = {
  Core: {
    UploadPublicFile: async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const relativeUrl = res.data.file_url;
      const fileUrl = relativeUrl.startsWith('http') ? relativeUrl : `http://localhost:8000${relativeUrl}`;
      return { file_url: fileUrl, ...res.data };
    }
  }
};

export const functions = {
  invoke: async (name, data) => (await apiClient.post(`/functions/${name}`, data)).data,
};

export const voice = {
  transcribe: async (audioBlob, language = 'en') => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('language', language);
    const res = await apiClient.post('/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  chat: async (message, language = 'en', history = []) => {
    const res = await apiClient.post('/assistant/chat', {
      message,
      language,
      history,
    });
    return res.data;
  }
};

export const app = {
  getPublicSettings: async () => ({})
};

// Exporting as default so we can replace base44 seamlessly
const api = {
  auth,
  entities,
  functions,
  integrations,
  app,
  voice,
};

export default api;
