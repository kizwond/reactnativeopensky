import {WebView} from 'react-native-webview';
import React, {useRef, useEffect} from 'react';
import Tts from 'react-native-tts';

const App = () => {
  // 웹뷰와 rn과의 소통은 아래의 ref 값을 이용하여 이루어집니다.
  let webviewRef = useRef();

  /** 웹뷰 ref */
  const handleSetRef = _ref => {
    webviewRef = _ref;
  };

  /** webview 로딩 완료시 */
  const handleEndLoading = e => {
    console.log('handleEndLoading');
    /** rn에서 웹뷰로 정보를 보내는 메소드 */
    webviewRef.postMessage('로딩 완료시 webview로 정보를 보내는 곳');
  };
  useEffect(() => {
    Tts.getInitStatus();
  });

  return (
    <WebviewContainer
      webviewRef={webviewRef}
      handleSetRef={handleSetRef}
      handleEndLoading={handleEndLoading}
    />
  );
};
const WebviewContainer = ({handleSetRef, handleEndLoading}) => {
  const uri = 'https://opensky.co.kr';

  /** 웹뷰에서 rn으로 값을 보낼때 거치는 함수 */
  const handleOnMessage = ({nativeEvent: {data}}) => {
    // data에 웹뷰에서 보낸 값이 들어옵니다.

    if (data) {
      console.log(JSON.parse(data));
      const ttsArray = JSON.parse(data);
      if (ttsArray.type === 'ttsArray') {
        const arrayContents = ttsArray.data;
        console.log(arrayContents);

        arrayContents.map(item => {
          Tts.getInitStatus().then(() => {
            Tts.speak(item);
          });
        });
      }
    } // console.log('tts starting');
  };
  const debugging = `
  const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
  console = {
      log: (log) => consoleLog('log', log),
      debug: (log) => consoleLog('debug', log),
      info: (log) => consoleLog('info', log),
      warn: (log) => consoleLog('warn', log),
      error: (log) => consoleLog('error', log),
    };
`;

  const onMessage = payload => {
    let dataPayload;
    try {
      dataPayload = JSON.parse(payload.nativeEvent.data);
    } catch (e) {}

    if (dataPayload) {
      if (dataPayload.type === 'Console') {
        console.info(`[Console] ${JSON.stringify(dataPayload.data)}`);
      } else {
        console.log(dataPayload);
      }
    }
  };
  return (
    <WebView
      onLoadEnd={handleEndLoading}
      onMessage={handleOnMessage}
      ref={handleSetRef}
      source={{uri}}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      injectedJavaScript={debugging}
    />
  );
};

export default App;
