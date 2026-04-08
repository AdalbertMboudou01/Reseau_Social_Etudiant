import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import SearchBar from './SearchBar';
import * as api from '../services/api';

jest.mock('../services/api');

function renderSearchBar() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <SearchBar /> },
      { path: '/search', element: <div>résultats</div> },
    ],
    { initialEntries: ['/'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    api.getSearchSuggestions.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigue vers /search avec la requête à la soumission du formulaire', async () => {
    const router = renderSearchBar();
    const input = screen.getByPlaceholderText(/rechercher/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'alice' } });
      jest.advanceTimersByTime(350);
    });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search');
      expect(router.state.location.search).toContain('q=alice');
    });
  });

  it('appelle getSearchSuggestions après debounce', async () => {
    renderSearchBar();
    const input = screen.getByPlaceholderText(/rechercher/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'bob' } });
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(api.getSearchSuggestions).toHaveBeenCalledWith('bob');
    });
  });
});
