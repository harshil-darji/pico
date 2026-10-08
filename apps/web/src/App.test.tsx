import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('shows the welcome message when no conversation exists', () => {
    render(<App />);
    expect(screen.getByText(/Hey! I'm Ana/i)).toBeInTheDocument();
  });

  it('renders the input placeholder', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Ask Ana anything/i)).toBeInTheDocument();
  });

  it('displays user message after sending', async () => {
    // Mock POST /conversations
    mockFetch.mockImplementation(async (url: string) => {
      if (url === '/conversations') {
        return {
          ok: true,
          json: async () => ({
            conversation: {
              id: 'conv-1',
              botId: 'bot-default',
              title: 'New conversation',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
            },
          }),
        };
      }
      if (url.includes('/messages')) {
        return {
          ok: true,
          json: async () => ({
            messages: [
              {
                id: 'msg-1',
                conversationId: 'conv-1',
                role: 'user' as const,
                content: 'Hello!',
                createdAt: '2025-01-01T00:00:00Z',
              },
              {
                id: 'msg-2',
                conversationId: 'conv-1',
                role: 'assistant' as const,
                content: 'simulated response',
                createdAt: '2025-01-01T00:00:01Z',
              },
            ],
          }),
        };
      }
      return { ok: false };
    });

    render(<App />);

    // Type a message
    const input = screen.getByPlaceholderText(/Ask Ana anything/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello!' } });
    });

    // Click send
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    });

    // Check messages appear
    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('simulated response')).toBeInTheDocument();
    });
  });

  it('disables input and button while sending', async () => {
    // First call (create conversation) resolves normally, second call (send message) is delayed
    let resolveMessages: (() => void) | null = null;

    mockFetch.mockImplementation(async (url: string) => {
      if (url === '/conversations') {
        return {
          ok: true,
          json: async () => ({
            conversation: { id: 'conv-1', botId: 'bot-default', title: 'Test', createdAt: '', updatedAt: '' },
          }),
        };
      }
      if (url.includes('/messages')) {
        return new Promise<Response>((resolve) => {
          resolveMessages = () =>
            resolve({
              ok: true,
              json: async () => ({
                messages: [
                  { id: 'msg-1', conversationId: 'conv-1', role: 'user' as const, content: 'Hello', createdAt: '' },
                  { id: 'msg-2', conversationId: 'conv-1', role: 'assistant' as const, content: 'Hi!', createdAt: '' },
                ],
              }),
            });
        });
      }
      return { ok: false };
    });

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask Ana anything/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    });

    // Input and button should be disabled while sending
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    // Resolve the delayed response
    if (resolveMessages) {
      resolveMessages();
    }

    // After response, input should be enabled again and message should appear
    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('sends message on Enter key press', async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url === '/conversations') {
        return {
          ok: true,
          json: async () => ({
            conversation: { id: 'conv-1', botId: 'bot-default', title: 'Test', createdAt: '', updatedAt: '' },
          }),
        };
      }
      if (url.includes('/messages')) {
        return {
          ok: true,
          json: async () => ({
            messages: [
              { id: 'msg-1', conversationId: 'conv-1', role: 'user' as const, content: 'Enter key', createdAt: '' },
              { id: 'msg-2', conversationId: 'conv-1', role: 'assistant' as const, content: 'Hi!', createdAt: '' },
            ],
          }),
        };
      }
      return { ok: false };
    });

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask Ana anything/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Enter key' } });
    });

    // Press Enter
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(screen.getByText('Enter key')).toBeInTheDocument();
    });
  });
});
