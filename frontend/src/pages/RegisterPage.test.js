import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import * as api from '../services/api';

jest.mock('../services/api');

function renderRegister() {
  const router = createMemoryRouter(
    [
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <div>login</div> },
    ],
    { initialEntries: ['/register'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.register.mockResolvedValue({ data: { message: 'ok' } });
  });

  it('affiche le formulaire d’inscription', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
  });

  it('envoie les champs requis à register', async () => {
    renderRegister();

    await userEvent.type(screen.getByPlaceholderText('Votre prénom'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('Votre nom'), 'Dupont');
    await userEvent.type(screen.getByPlaceholderText('votre@email.com'), 'new@test.com');
    await userEvent.type(screen.getByPlaceholderText(/minimum 6 caractères/i), 'secret12');

    await userEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.com',
          password: 'secret12',
          nom: 'Dupont',
          prenom: 'Alice',
        })
      );
    });
  });
});
