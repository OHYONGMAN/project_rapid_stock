import * as signalR from '@microsoft/signalr'; // SignalR 라이브러리를 가져옵니다.

export class SignalRService {
  connection: signalR.HubConnection; // SignalR HubConnection 객체를 선언합니다.

  constructor() {
    // SignalR HubConnection을 생성하고 설정합니다.
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://js.devexpress.com/Demos/NetCore/stockTickDataHub') // SignalR 허브 URL을 설정합니다.
      .withAutomaticReconnect() // 자동 재연결을 설정합니다.
      .build(); // HubConnection 객체를 빌드합니다.
  }

  async start() {
    // SignalR 연결을 시작하는 메서드입니다.
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      // 연결 상태가 'Disconnected'인 경우에만 연결을 시작합니다.
      try {
        await this.connection.start(); // 연결을 시작합니다.
        console.log('SignalR Connected.'); // 연결 성공 시 메시지를 출력합니다.
      } catch (err) {
        console.log(err); // 연결 실패 시 오류를 출력합니다.
        throw err; // 오류를 다시 던집니다.
      }
    }
  }

  onStockTick(callback: (data: any) => void) {
    // 주식 가격 업데이트를 수신하는 메서드입니다.
    this.connection.on('updateStockPrice', (data) => {
      // 'updateStockPrice' 이벤트가 발생할 때 호출됩니다.
      callback(data); // 콜백 함수를 호출하여 데이터를 전달합니다.
    });
  }

  subscribeToStock(symbol: string) {
    // 특정 주식 심볼에 대한 구독을 시작하는 메서드입니다.
    if (this.isConnected()) {
      // 연결이 되어 있는 경우에만 구독을 시작합니다.
      this.connection.invoke('connect', symbol).catch((error) => {
        // 'connect' 메서드를 호출하여 구독을 시작합니다.
        console.error('Failed to subscribe:', error); // 구독 실패 시 오류를 출력합니다.
        // 여기서 추가적인 오류 처리 로직을 구현할 수 있습니다.
      });
    }
  }

  unsubscribeFromStock(symbol: string) {
    // 특정 주식 심볼에 대한 구독을 취소하는 메서드입니다.
    if (this.isConnected()) {
      // 연결이 되어 있는 경우에만 구독을 취소합니다.
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        // 연결 상태가 'Connected'인 경우에만 구독을 취소합니다.
        this.connection.invoke('disconnect', symbol); // 'disconnect' 메서드를 호출하여 구독을 취소합니다.
      }
    }
  }

  isConnected(): boolean {
    // 연결 상태를 확인하는 메서드입니다.
    return this.connection.state === signalR.HubConnectionState.Connected; // 연결 상태가 'Connected'인지 확인합니다.
  }
}
