# Order Book Demo

本專案是一個使用 React、TypeScript、Vite、Tailwind CSS、WebSocket 的交易資訊展示

## 功能

1. 使用 WebSocket 接收即時交易數據
2. 實現買賣盤的即時更新與動畫效果
3. 顯示最新成交價格與漲跌趨勢
4. 使用 React Profiler 監控渲染效能並優化效能

## 本地運行

1. 複製環境變數範例檔案：

```bash
cp .env.example .env
```

2. 根據需要修改 `.env` 中的配置：

```bash
# WebSocket 基本 URL
VITE_WS_BASE_URL=wss://ws.btse.com/ws

# WebSocket 路徑
VITE_WS_FUTURES_PATH=/futures
VITE_WS_OSS_FUTURES_PATH=/oss/futures
```

3. 安裝依賴並啟動：

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行測試
npm run test
```

## 架構設計

### 專案結構

```
src/
├── lib/
│   ├── components/       # 展示型元件
│   ├── container/        # 容器型元件
│   ├── helpers/          # 工具函數
│   ├── hooks/            # React Hooks
│   ├── services/         # WebSocket 服務
│   ├── types/            # TypeScript 類型定義
│   ├── websocket/        # WebSocket 管理
│   └── __tests__/        # 測試文件
├── pages/                # 頁面元件
└── App.tsx
```

### 分層架構

專案採用清晰的分層架構，確保關注點分離和代碼可維護性：

#### 1. 視圖層（容器型元件）

負責數據獲取和狀態管理，不包含具體的 UI 邏輯：

- **OrderBookContainer**
  - 使用 `useOrderBook` Hook 獲取數據
  - 將數據傳遞給展示型元件
  - 不包含樣式和 UI 邏輯

#### 2. 視圖層（展示型元件）

純展示型元件，專注於 UI 渲染：

- **OrderBook**

  - 訂單簿主視圖
  - 組織買賣盤和最新價格的佈局
  - 處理價格變化的動畫效果

- **OrderBookSide**

  - 買賣盤的表格結構
    - 使用 div 而非 table，以避免 table 的限制
  - 處理價格排序和顯示邏輯

- **OrderBookRow**

  - 單條訂單數據的展示
  - 處理數字格式化
  - 實現價格閃爍動畫

- **OrderBookLastPrice**
  - 最新成交價格顯示
  - 處理價格趨勢箭頭
  - 實現價格變化動畫

#### 3. 服務層

處理數據和業務邏輯：

- **WebSocketManager**

  - WebSocket 連接管理
  - 自動重連機制
  - 消息訂閱和分發

- **OrderBookService**

  - 訂單簿數據處理
  - 維護訂單快照
  - 處理增量更新
  - 數據排序和轉換

- **TradeService**
  - 最新成交價格處理
  - 價格趨勢計算

#### 4. Hook 層

連接服務層和視圖層：

- **useOrderBook**
  - 初始化 WebSocket 服務
  - 管理訂單簿和交易數據的狀態
  - 提供數據更新回調

### WebSocket 管理

- **連接處理**

  - 自動重連機制
  - 連接狀態監控
  - 錯誤處理和恢復連接

- **數據處理**

  - 訂閱管理
  - 消息隊列實現

### 未來優化

1. **效能優化**

- **渲染效能**

  - 使用 React.memo 優化不必要的組件重渲染
  - 優化 useMemo 的使用時機
  - 優化動畫效能

2. **測試完善**

- **單元測試**

  - 提升測試覆蓋率至 80% 以上
  - 添加組件快照測試
  - 補充 hooks 單元測試

- **整合測試**

- **E2E 測試**

3. **功能擴展**

- **多交易對支援**

  - 重構 useOrderBook hook 支援多交易對訂閱
  - 實現交易對切換功能
  - 優化多交易對數據管理

- **微前端整合**
  - 實現 CSS 模組化，避免樣式衝突
  - 設計與主應用的狀態同步機制
  - 優化資源共享策略（WebSocket、API 等）

4. **安全性強化**

- **錯誤處理**
  - 完善錯誤邊界處理
  - 添加用戶友好的錯誤提示

5. **開發體驗優化**

- **工具鏈優化**

  - 優化構建流程和打包大小
  - 添加自動化部署流程

- **文檔完善**
  - 添加元件使用示例
