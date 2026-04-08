/**
 * @jest-environment jsdom
 */

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe('api service', () => {
  it('ajoute le Bearer si un token est présent dans localStorage', async () => {
    localStorage.setItem('token', 'abc');
    delete window.location;
    window.location = { href: '' };

    let requestInterceptor;
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn((fn) => {
            requestInterceptor = fn;
          }),
        },
        response: {
          use: jest.fn(() => {}),
        },
      },
      get: jest.fn(() => Promise.resolve({ data: {} })),
    };
    jest.resetModules();
    require('axios').default.create.mockReturnValue(mockAxiosInstance);
    const api = require('./api');
    await api.getProfile();

    expect(requestInterceptor).toBeDefined();
    const cfg = { headers: {} };
    requestInterceptor(cfg);
    expect(cfg.headers.Authorization).toBe('Bearer abc');
  });
});
