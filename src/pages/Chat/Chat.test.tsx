/**
 * Chat 頁面 - 聊天室進出流程測試
 *
 * 測試重點：
 * 1. 初始畫面是聊天室選擇（ChatEnterBlock）
 * 2. onEnterGroup 觸發後切換至聊天介面（ChatBlock）
 * 3. onLeave 觸發後回到選擇畫面
 */

import React, { Suspense } from 'react';
import { render, act } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import Chat from './index';

// ── Module Mocks ────────────────────────────────────────────────
// Jest 會自動將 jest.mock() 提升（hoist）到模組頂部，
// 所以 import 寫在前面不影響 mock 的生效時機。

// 使用 lazy 的 Container / ScrollToTop，以簡單元件替代
jest.mock('../../common/Container', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="container">{children}</div>
  ),
}));

jest.mock('../../common/ScrollToTop', () => ({
  __esModule: true,
  default: () => null,
}));

// ChatEnterBlock：模擬一個可觸發 onEnterGroup 的按鈕
jest.mock('../../components/ChatEnter', () => ({
  __esModule: true,
  default: ({ onEnterGroup }: { onEnterGroup: (g: any) => void }) => (
    <div data-testid="chat-enter-block">
      <button
        onClick={() =>
          onEnterGroup({ id: 1, name: '測試房', created_at: '2024-01-01T00:00:00Z' })
        }
      >
        進入房間
      </button>
    </div>
  ),
}));

// ChatBlock：模擬聊天介面，顯示房間名並提供「離開」按鈕
jest.mock('../../components/Chat', () => ({
  __esModule: true,
  default: ({ group, onLeave }: { group: any; onLeave: () => void }) => (
    <div data-testid="chat-block">
      <span>聊天室：{group.name}</span>
      <button onClick={onLeave}>離開</button>
    </div>
  ),
}));

// ── Helper ─────────────────────────────────────────────────────
function renderChat() {
  return render(
    <Suspense fallback={<div>Loading...</div>}>
      <Chat />
    </Suspense>
  );
}

// ── Tests ───────────────────────────────────────────────────────
describe('Chat 頁面 - 聊天室進出流程', () => {
  test('✅ 初始狀態應顯示聊天室選擇畫面（ChatEnterBlock）', async () => {
    renderChat();

    expect(await screen.findByTestId('chat-enter-block')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-block')).not.toBeInTheDocument();
  });

  test('✅ 觸發 onEnterGroup 後應切換至聊天介面（ChatBlock）', async () => {
    renderChat();

    const enterBtn = await screen.findByText('進入房間');
    act(() => {
      enterBtn.click();
    });

    expect(await screen.findByTestId('chat-block')).toBeInTheDocument();
    expect(screen.getByText('聊天室：測試房')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-enter-block')).not.toBeInTheDocument();
  });

  test('✅ 點擊「離開」後應回到聊天室選擇畫面', async () => {
    renderChat();

    // 進入聊天室
    const enterBtn = await screen.findByText('進入房間');
    act(() => {
      enterBtn.click();
    });
    expect(await screen.findByTestId('chat-block')).toBeInTheDocument();

    // 離開
    act(() => {
      screen.getByText('離開').click();
    });

    expect(await screen.findByTestId('chat-enter-block')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-block')).not.toBeInTheDocument();
  });

  test('✅ 傳入正確的 group 物件給 ChatBlock', async () => {
    renderChat();

    act(() => {
      screen.getByText('進入房間').click();
    });

    // ChatBlock mock 會顯示 group.name
    expect(await screen.findByText('聊天室：測試房')).toBeInTheDocument();
  });
});
