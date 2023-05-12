import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Button, IconButton } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircleIcon from '@mui/icons-material/Circle';
import { tabletV } from '@/utils/Mixin';

function Monitor({ monitorId }: { monitorId: number }) {
  const [img, setImg] = useState<string>();
  const currentOffset = useRef<number>(0);
  const ws = useRef<WebSocket>();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [maxoffset, setMaxOffset] = useState<number>(2);
  const [pause, setPause] = useState<boolean>(false);
  const [time, setTime] = useState<string>('');

  const [hoverd, setHoverd] = useState<boolean>(false);

  async function connectWebSocket(offset: number) {
    if (ws.current) {
      ws.current.close();
      await new Promise(resolve => {
        if (ws.current) ws.current.onclose = resolve;
      });
    }

    const websocket = new WebSocket(
      `wss://k8d201.p.ssafy.io/fast?cctvnumber=${monitorId}&partition=131`
    );

    // const websocket = new WebSocket(
    //   `ws://k8d201.p.ssafy.io:7005/wss?cctvnumber=${monitorId}&partition=129`
    // );

    websocket.onmessage = async event => {
      const frameData = event.data;
      const data = JSON.parse(frameData);

      setImg('data:image/jpeg;base64,' + data['frame']);
      // setMaxOffset(data.total);
      currentOffset.current = data.offset;

      const timestamp = data.timestamp;
      var timestampDate = new Date(timestamp);
      var hours = timestampDate.getHours();
      var minutes = timestampDate.getMinutes();
      var seconds = timestampDate.getSeconds();
      var timestampString = hours + ':' + minutes + ':' + seconds;
      setTime(timestampString);

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ offset: currentOffset.current }));
        }
      }, 100);
    };

    websocket.onclose = () => {
      console.log('close됨');
    };

    websocket.onopen = () => {
      console.log('WebSocket connection established.');
      // websocket.send(JSON.stringify({ offset: currentOffset.current }));
    };

    websocket.onerror = event => {
      console.error('WebSocket error observed:', event);
    };

    ws.current = websocket;
  }

  useEffect(() => {
    axios({
      method: 'get',
      url: `https://k8d201.p.ssafy.io/fast/max_offset?cctvnumber=${monitorId}&partition=131`,
    }).then(res => {
      console.log(res.data);
      setMaxOffset(res.data.offsets);
      if (res.data.offsets !== 0) {
        connectWebSocket(currentOffset.current);
      }
    });
    return () => {
      if (ws.current && ws.current.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  const buttonH = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = Number(e.currentTarget.value);

    currentOffset.current = newOffset;
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setPause(false);
      ws.current.send(JSON.stringify({ offset: currentOffset.current - 1 }));
    } else {
      console.error('웹소켓이 열려있지 않습니다.');
    }
  };

  if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
    return (
      <LoadingDiv>
        <div className="spinner-square">
          <div className="square-1 square"></div>
          <div className="square-2 square"></div>
          <div className="square-3 square"></div>
        </div>
      </LoadingDiv>
    );
  }

  const pauseHandler = () => {
    setPause(prev => {
      if (prev) {
        if (ws.current)
          ws.current.send(
            JSON.stringify({ offset: currentOffset.current - 1 })
          );
      } else {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
      }
      return !prev;
    });
  };

  const hoverHandler = () => {
    setHoverd(true);
  };

  const mouseLeaveHandler = () => {
    setHoverd(false);
  };

  const realTimeHandler = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ offset: maxoffset - 1 }));
    }
  };

  return (
    <MonitorDiv onMouseEnter={hoverHandler} onMouseLeave={mouseLeaveHandler}>
      <img src={img} alt="" />
      <MonitorTitle hoverd={hoverd}>{monitorId}번 카메라</MonitorTitle>
      <MonitorBottom hoverd={hoverd}>
        <input
          type="range"
          onChange={buttonH}
          min={0}
          max={maxoffset}
          step={1}
          value={currentOffset.current - 1}
        />
        <div>
          <PauseButton color="primary" onClick={pauseHandler}>
            {pause ? <PlayArrowIcon /> : <PauseIcon />}
          </PauseButton>
          <RealTimeButton variant="contained" onClick={realTimeHandler}>
            <CircleIcon />
            실시간
          </RealTimeButton>
          {time}
        </div>
      </MonitorBottom>
    </MonitorDiv>
  );
}

export default Monitor;

const MonitorDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  overflow: hidden;

  input {
    width: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const MonitorTitle = styled.div<{ hoverd: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  margin: 1rem;
  padding: 0.2rem;

  transition: 1s ease all;

  transform: ${props => {
    if (props.hoverd) {
      return 'translate(0, 0)';
    } else {
      return 'translate(0, -5rem)';
    }
  }};

  background-color: #00000098;
  border-radius: 0.5rem;

  color: white;
  font-size: 1.5rem;
`;

const MonitorBottom = styled.div<{ hoverd: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: fit-content;
  bottom: 0;
  left: 0;

  background-color: #00000098;

  transition: 1s ease all;

  transform: ${props => {
    if (props.hoverd) {
      return 'translate(0, 0)';
    } else {
      return 'translate(0, 5rem)';
    }
  }};

  color: white;
`;

const PauseButton = styled(IconButton)`
  width: fit-content;
`;

const RealTimeButton = styled(Button)`
  font-size: 0.7rem;

  svg {
    font-size: 0.4rem;
    margin-right: 0.5rem;
    color: ${props => props.theme.palette.error.main};
  }
`;

const loadingSpinner = keyframes`
    0% {
        height: 5rem;
        background-color: rgb(111, 200, 240);
    }
    20% {
        height: 5rem;
    }
    40% {
        height: 7rem;
        background-color: rgb(111, 200, 240);
    }
    80% {
        height: 5rem;
    }
    100% {
        height: 5rem;
        background-color: rgb(111, 163, 240);
    }
`;
const LoadingDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;
  height: 480px;

  .spinner-square {
    display: flex;
    flex-direction: row;
    width: 90px;
    height: 120px;
  }

  .spinner-square > .square {
    width: 17px;
    height: 80px;
    margin: auto auto;
    border-radius: 4px;
  }

  .square-1 {
    animation: ${loadingSpinner} 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 0s
      infinite;
  }

  .square-2 {
    animation: ${loadingSpinner} 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)
      200ms infinite;
  }

  .square-3 {
    animation: ${loadingSpinner} 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95)
      400ms infinite;
  }
`;
