import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as api from '../services/api';

jest.mock('../services/api');

const mockLoginUser = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ loginUser: mockLoginUser }),
}));

function renderLoginAt(path = '/login') {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <div>accueil</div> },
    ],
    { initialEntries: [path] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.login.mockResolvedValue({ data: { token: 'jwt-test' } });
    api.getProfile.mockResolvedValue({
      data: { id: 1, email: 'u@test.com', prenom: 'U', nom: 'V' },
    });
  });

  it('affiche le formulaire de connexion', () => {
    renderLoginAt();
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('soumet email et mot de passe puis connecte', async () => {
    const router = renderLoginAt();

    await userEvent.type(screen.getByPlaceholderText('votre@email.com'), 'u@test.com');
    await userEvent.type(document.querySelector('input[type="password"]'), 'secret12');
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'u@test.com',
        password: 'secret12',
      });
    });
    await waitFor(() => {
      expect(api.getProfile).toHaveBeenCalled();
      expect(mockLoginUser).toHaveBeenCalledWith(
        'jwt-test',
        expect.objectContaining({ email: 'u@test.com' })
      );
      expect(router.state.location.pathname).toBe('/');
    });
  });

  it('affiche un message si la connexion échoue', async () => {
    api.login.mockRejectedValueOnce({
      response: { data: { message: 'Identifiants invalides' } },
    });
    renderLoginAt();

    await userEvent.type(screen.getByPlaceholderText('votre@email.com'), 'bad@test.com');
    await userEvent.type(document.querySelector('input[type="password"]'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/identifiants invalides/i)).toBeInTheDocument();
  });
});
