/**
 * ChatEnterBlock - 建立 / 加入聊天室測試
 *
 * 測試重點：
 * 1. 建立聊天室 → 成功後應自動呼叫 onEnterGroup 進入聊天介面
 * 2. 加入聊天室 → 成功後自動呼叫 onEnterGroup 進入聊天介面
 * 3. 點擊群組列表項目 → 應呼叫 onEnterGroup
 * 4. 錯誤處理與輸入驗證
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { AuthContext } from '../../contexts/AuthContext';

// ── Module Mocks ────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  withTranslation: () => (Component: any) =>
    function Wrapped(props: any) {
      return <Component {...props} t={(k: string) => k} />;
    },
}));

jest.mock('react-awesome-reveal', () => ({
  Slide: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('antd', () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Col: ({ children }: any) => <div>{children}</div>,
  List: Object.assign(
    ({ dataSource, renderItem, locale }: any) =>
      dataSource && dataSource.length > 0 ? (
        <ul data-testid="group-list">
          {dataSource.map((item: any, i: number) => (
            <li key={i}>{renderItem(item)}</li>
          ))}
        </ul>
      ) : (
        <div data-testid="empty-list">{locale?.emptyText}</div>
      ),
    {
      Item: ({ children, onClick, style }: any) => (
        <div onClick={onClick} style={style}>
          {children}
        </div>
      ),
    }
  ),
  Spin: ({ children }: any) => <>{children}</>,
  // 測試中略過二次確認，點擊即視為確認
  Popconfirm: ({ children, onConfirm }: any) => (
    <span onClick={onConfirm}>{children}</span>
  ),
}));

jest.mock('../../common/Input', () =>
  function MockInput({ name, value, onChange, placeholder }: any) {
    return (
      <input
        data-testid={`input-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
);

jest.mock('../../common/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('./styles', () => ({
  ChatContainer: ({ children }: any) => <div data-testid="chat-enter-container">{children}</div>,
  FormGroup: ({ children }: any) => <div>{children}</div>,
  ButtonContainer: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

import ChatEnterBlock from './index';

// ── Constants ───────────────────────────────────────────────────
const MOCK_TOKEN = 'mock-jwt-token';
const MOCK_USER = { id: 1, username: 'testUser' };

const MOCK_GROUPS = [
  { id: 1, name: '一般討論', owner_id: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: '技術分享', owner_id: 2, created_at: '2024-01-02T00:00:00Z' },
];

// ── Helpers ─────────────────────────────────────────────────────
function renderBlock(onEnterGroup = jest.fn()) {
  Storage.prototype.getItem = jest.fn((key: string) =>
    key === 'token' ? MOCK_TOKEN : null
  );

  return {
    onEnterGroup,
    ...render(
      <AuthContext.Provider
        value={{
          user: MOCK_USER,
          isLoggedIn: true,
          isInitialized: true,
          login: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <ChatEnterBlock onEnterGroup={onEnterGroup} />
      </AuthContext.Provider>
    ),
  };
}

function mockFetchEmpty() {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { groups: [] } }),
  });
}

// ── Tests ───────────────────────────────────────────────────────
describe('ChatEnterBlock - 初始化', () => {
  beforeEach(() => jest.clearAllMocks());

  test('✅ 顯示使用者名稱歡迎訊息', async () => {
    global.fetch = mockFetchEmpty();
    renderBlock();
    expect(await screen.findByText(/歡迎，testUser/)).toBeInTheDocument();
  });

  test('✅ 初始載入時呼叫 GET /api/chat/groups（帶 Authorization header）', async () => {
    global.fetch = mockFetchEmpty();
    renderBlock();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_TOKEN}`,
          }),
        })
      );
    });
  });

  test('✅ 有群組時應渲染群組列表', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { groups: MOCK_GROUPS } }),
    });
    renderBlock();
    expect(await screen.findByText('一般討論')).toBeInTheDocument();
    expect(await screen.findByText('技術分享')).toBeInTheDocument();
  });

  test('✅ 無群組時顯示空白提示文字', async () => {
    global.fetch = mockFetchEmpty();
    renderBlock();
    expect(await screen.findByTestId('empty-list')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────
describe('ChatEnterBlock - 建立聊天室', () => {
  const CREATED_GROUP = { id: 5, name: '新群組', created_at: '2024-01-10T00:00:00Z' };

  beforeEach(() => jest.clearAllMocks());

  function mockFetchCreate() {
    return jest
      .fn()
      // 初始 GET
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      // POST 建立
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { group: CREATED_GROUP } }),
      })
      // fetchGroups 刷新
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [CREATED_GROUP] } }),
      });
  }

  test('✅ 建立成功後應呼叫 onEnterGroup 並自動進入聊天介面', async () => {
    global.fetch = mockFetchCreate();
    const { onEnterGroup } = renderBlock();

    fireEvent.change(await screen.findByTestId('input-newGroupName'), {
      target: { value: '新群組' },
    });
    fireEvent.click(screen.getByText('建立'));

    await waitFor(() => {
      expect(onEnterGroup).toHaveBeenCalledTimes(1);
      expect(onEnterGroup).toHaveBeenCalledWith(CREATED_GROUP);
    });
  });

  test('✅ 建立時送出正確的 POST 請求', async () => {
    global.fetch = mockFetchCreate();
    renderBlock();

    fireEvent.change(await screen.findByTestId('input-newGroupName'), {
      target: { value: '新群組' },
    });
    fireEvent.click(screen.getByText('建立'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MOCK_TOKEN}`,
          }),
          body: JSON.stringify({ name: '新群組' }),
        })
      );
    });
  });

  test('✅ 名稱為空時不應發出 POST 請求', async () => {
    global.fetch = mockFetchEmpty();
    renderBlock();

    await screen.findByTestId('input-newGroupName'); // 等渲染完成
    fireEvent.click(screen.getByText('建立'));

    // 只有初始的 GET，沒有 POST
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  });

  test('✅ 建立失敗時顯示伺服器錯誤訊息', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: '名稱已存在' }),
      });

    renderBlock();

    fireEvent.change(await screen.findByTestId('input-newGroupName'), {
      target: { value: '重複名稱' },
    });
    fireEvent.click(screen.getByText('建立'));

    expect(await screen.findByText('名稱已存在')).toBeInTheDocument();
  });

  test('✅ 建立成功後清空輸入欄', async () => {
    global.fetch = mockFetchCreate();
    renderBlock();

    const input = await screen.findByTestId('input-newGroupName');
    fireEvent.change(input, { target: { value: '新群組' } });
    fireEvent.click(screen.getByText('建立'));

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});

// ─────────────────────────────────────────────────────────────────
describe('ChatEnterBlock - 加入聊天室', () => {
  const EXISTING_GROUP = { id: 3, name: '現有群組', created_at: '2024-01-05T00:00:00Z' };

  beforeEach(() => jest.clearAllMocks());

  function mockFetchJoinSuccess() {
    return jest
      .fn()
      // 初始 GET
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      // POST join
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '成功加入群組' }),
      })
      // fetchGroups 刷新
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [EXISTING_GROUP] } }),
      });
  }

  test('✅ 加入成功後應自動呼叫 onEnterGroup 進入聊天介面', async () => {
    global.fetch = mockFetchJoinSuccess();
    const { onEnterGroup } = renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('加入'));

    await waitFor(() => {
      expect(onEnterGroup).toHaveBeenCalledTimes(1);
      expect(onEnterGroup).toHaveBeenCalledWith(EXISTING_GROUP);
    });
  });

  test('✅ 加入成功後刷新群組列表', async () => {
    global.fetch = mockFetchJoinSuccess();
    renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('加入'));

    // 加入後刷新列表，群組應出現
    expect(await screen.findByText('現有群組')).toBeInTheDocument();
  });

  test('✅ 加入成功後，點擊列表中的群組才能進入聊天介面', async () => {
    global.fetch = mockFetchJoinSuccess();
    const { onEnterGroup } = renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('加入'));

    // 等群組出現後手動點擊
    fireEvent.click(await screen.findByText('現有群組'));

    expect(onEnterGroup).toHaveBeenCalledWith(EXISTING_GROUP);
  });

  test('✅ 加入時送出正確的 POST 請求', async () => {
    global.fetch = mockFetchJoinSuccess();
    renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByText('加入'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups/3/join',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_TOKEN}`,
          }),
        })
      );
    });
  });

  test('✅ 非數字輸入改用名稱搜尋，無結果時顯示錯誤訊息', async () => {
    global.fetch = mockFetchEmpty();
    renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByText('加入'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups/search?name=abc',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_TOKEN}`,
          }),
        })
      );
    });
    expect(await screen.findByText('找不到符合名稱的聊天室')).toBeInTheDocument();
  });

  test('✅ 名稱搜尋唯一結果時自動加入並進入聊天介面', async () => {
    const FOUND = { id: 7, name: '週末揪團', created_at: '2024-01-07T00:00:00Z' };
    global.fetch = jest
      .fn()
      // 初始 GET groups
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      // GET search
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [FOUND] } }),
      })
      // POST join
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '加入成功', data: {} }),
      })
      // fetchGroups 刷新
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [FOUND] } }),
      });

    const { onEnterGroup } = renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '週末' },
    });
    fireEvent.click(screen.getByText('加入'));

    await waitFor(() => expect(onEnterGroup).toHaveBeenCalledWith(FOUND));
    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:4000/api/chat/groups/search?name=${encodeURIComponent('週末')}`,
      expect.anything()
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/chat/groups/7/join',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('✅ 名稱搜尋多筆結果時顯示於列表，點擊即可加入', async () => {
    const R1 = { id: 8, name: '讀書會A', created_at: '2024-01-08T00:00:00Z' };
    const R2 = { id: 9, name: '讀書會B', created_at: '2024-01-09T00:00:00Z' };
    global.fetch = jest
      .fn()
      // 初始 GET groups
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      // GET search（兩筆結果）
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [R1, R2] } }),
      })
      // POST join R1
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '加入成功', data: {} }),
      })
      // fetchGroups 刷新
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [R1] } }),
      });

    const { onEnterGroup } = renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '讀書會' },
    });
    fireEvent.click(screen.getByText('加入'));

    // 兩筆搜尋結果顯示在列表上方
    expect(await screen.findByText('讀書會A')).toBeInTheDocument();
    expect(screen.getByText('讀書會B')).toBeInTheDocument();
    expect(screen.getAllByText('搜尋結果')).toHaveLength(2);

    // 點擊第一筆即加入並進入
    fireEvent.click(screen.getByText('讀書會A'));
    await waitFor(() => expect(onEnterGroup).toHaveBeenCalledWith(R1));
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/chat/groups/8/join',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('✅ 加入失敗時顯示伺服器錯誤訊息', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { groups: [] } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: '群組不存在' }),
      });

    renderBlock();

    fireEvent.change(await screen.findByTestId('input-joinGroupId'), {
      target: { value: '999' },
    });
    fireEvent.click(screen.getByText('加入'));

    expect(await screen.findByText('群組不存在')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────
describe('ChatEnterBlock - 群組管理（退出 / 改名 / 刪除）', () => {
  beforeEach(() => jest.clearAllMocks());

  function mockFetchGroups(groups = MOCK_GROUPS) {
    return jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { groups } }),
    });
  }

  test('✅ 自己建立的群組顯示 改名/刪除/退出，他人群組僅顯示 退出', async () => {
    global.fetch = mockFetchGroups();
    renderBlock();

    await screen.findByText('一般討論');
    // user.id = 1：group 1 是 owner、group 2 不是
    expect(screen.getAllByText('退出')).toHaveLength(2);
    expect(screen.getAllByText('改名')).toHaveLength(1);
    expect(screen.getAllByText('刪除')).toHaveLength(1);
  });

  test('✅ 點擊退出應送出 DELETE /groups/:id/leave 並刷新列表', async () => {
    global.fetch = mockFetchGroups();
    renderBlock();

    await screen.findByText('技術分享');
    fireEvent.click(screen.getAllByText('退出')[1]); // group 2

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups/2/leave',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${MOCK_TOKEN}`,
          }),
        })
      );
    });
  });

  test('✅ 點擊刪除應送出 DELETE /groups/:id', async () => {
    global.fetch = mockFetchGroups();
    renderBlock();

    await screen.findByText('一般討論');
    fireEvent.click(screen.getByText('刪除')); // group 1（owner）

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('✅ 改名流程：點改名 → 輸入 → 確認，送出 PUT /groups/:id', async () => {
    global.fetch = mockFetchGroups();
    renderBlock();

    await screen.findByText('一般討論');
    fireEvent.click(screen.getByText('改名'));

    const editInput = screen.getByDisplayValue('一般討論');
    fireEvent.change(editInput, { target: { value: '新名稱' } });
    fireEvent.click(screen.getByText('確認'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/chat/groups/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: '新名稱' }),
        })
      );
    });
  });

  test('✅ 點擊管理按鈕不應觸發 onEnterGroup（stopPropagation）', async () => {
    global.fetch = mockFetchGroups();
    const { onEnterGroup } = renderBlock();

    await screen.findByText('一般討論');
    fireEvent.click(screen.getByText('改名')); // group 1 進入編輯模式
    fireEvent.click(screen.getByText('退出')); // 剩下 group 2 的退出按鈕

    expect(onEnterGroup).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────
describe('ChatEnterBlock - 點擊群組列表', () => {
  beforeEach(() => jest.clearAllMocks());

  test('✅ 點擊群組列表項目應呼叫 onEnterGroup 傳入對應 group 物件', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { groups: MOCK_GROUPS } }),
    });

    const { onEnterGroup } = renderBlock();

    fireEvent.click(await screen.findByText('一般討論'));
    expect(onEnterGroup).toHaveBeenCalledWith(MOCK_GROUPS[0]);

    fireEvent.click(screen.getByText('技術分享'));
    expect(onEnterGroup).toHaveBeenCalledWith(MOCK_GROUPS[1]);
  });
});
