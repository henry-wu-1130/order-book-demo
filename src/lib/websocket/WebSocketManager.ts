export interface WebSocketMessage {
  topic?: string;
  channel?: string;
  [key: string]: any;
}

export interface WebSocketConfig {
  url: string;
  onMessage?: (data: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
}

export class WebSocketManager {
  private static instances: Map<string, WebSocketManager> = new Map();
  private messageHandlers: Map<string, Set<(data: WebSocketMessage) => void>> =
    new Map();
  private pendingSubscriptions: Map<
    string,
    Set<(data: WebSocketMessage) => void>
  > = new Map();
  private ws: WebSocket | null = null;
  private readonly config: WebSocketConfig;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;

  public static getInstance(config: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instances.has(config.url)) {
      WebSocketManager.instances.set(config.url, new WebSocketManager(config));
    }
    return WebSocketManager.instances.get(config.url)!;
  }

  private constructor(config: WebSocketConfig) {
    this.config = config;
    this.connect();
  }

  private async connect() {
    try {
      this.ws = new WebSocket(this.config.url);

      // 等待連接建立
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket is null'));

        const onOpen = () => {
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          resolve();
        };

        const onError = (error: Event) => {
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          reject(error);
        };

        this.ws.addEventListener('open', onOpen);
        this.ws.addEventListener('error', onError);
      });

      this.setupEventListeners();
    } catch (error) {
      this.handleReconnect();
      throw error; // 向上拋出錯誤，讓調用者知道連接失敗
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = async () => {
      this.reconnectAttempts = 0;
      this.config.onOpen?.();

      // 處理等待中的訂閱
      for (const [topic] of this.pendingSubscriptions) {
        await this.sendSubscription(topic);
      }
      this.pendingSubscriptions.clear();

      // 重新訂閱現有的主題
      for (const [topic] of this.messageHandlers) {
        await this.sendSubscription(topic);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 查找匹配的處理程序
        this.messageHandlers.forEach((handlers, registeredTopic) => {
          // 檢查消息的主題是否與註冊的主題匹配
          // 例如：如果註冊的是 'tradeHistoryApi:BTCPFC'，
          // 而收到的消息主題是 'tradeHistoryApi'，我們也認為是匹配的
          const messageTopic = data.topic || data.channel;
          if (messageTopic && registeredTopic.startsWith(messageTopic)) {
            console.log('Received message for topic:', registeredTopic);

            handlers.forEach((handler) => {
              if (typeof handler === 'function') {
                handler(data);
              } else {
                handlers.delete(handler);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      this.config.onError?.(error);
      this.handleReconnect();
    };

    this.ws.onclose = (event) => {
      this.config.onClose?.(event);
      this.handleReconnect();
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => this.connect(), this.RECONNECT_DELAY);
  }

  private async sendSubscription(topic: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const subscribeMessage = {
      op: 'subscribe',
      args: [topic],
    };

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws!.send(JSON.stringify(subscribeMessage));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async subscribe(
    topic: string,
    handler: (data: WebSocketMessage) => void
  ) {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, new Set());
    }
    const handlers = this.messageHandlers.get(topic)!;

    if (handlers.has(handler)) {
      return;
    }

    if (typeof handler !== 'function') {
      return;
    }

    handlers.add(handler);

    // 如果 WebSocket 未連接，將訂閱加入等待佇列
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (!this.pendingSubscriptions.has(topic)) {
        this.pendingSubscriptions.set(topic, new Set());
      }
      this.pendingSubscriptions.get(topic)!.add(handler);
      await this.connect();
      return;
    }

    // 如果 WebSocket 已經連接，直接發送訂閱消息
    await this.sendSubscription(topic);
  }

  public unsubscribe(topic: string, handler: (data: WebSocketMessage) => void) {
    const handlers = this.messageHandlers.get(topic);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(topic);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ op: 'unsubscribe', args: [topic] }));
        }
      }
    }
  }

  public close() {
    this.ws?.close();
    this.ws = null;
    WebSocketManager.instances.delete(this.config.url);
  }
}
