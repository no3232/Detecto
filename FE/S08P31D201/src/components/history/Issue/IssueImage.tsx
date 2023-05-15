import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import IssueWorkerImage from './IssueWorkerImage';

function IssueImage({ reportid }: { reportid: string }) {
  const [wi, setWi] = useState<boolean>(false);
  const [iOffset, setIoffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const workerImage = useRef<HTMLDivElement>(null);

  const mouseMoveHandler = (event: React.MouseEvent<HTMLImageElement>) => {
    if (workerImage.current) {
      
      const { clientX, clientY } = event;
      const boundingRect = event.currentTarget.getBoundingClientRect();
      const offsetX = clientX - boundingRect.left
      const offsetY = clientY - boundingRect.top - (workerImage.current.clientHeight / 3);
      setIoffset({ x: offsetX, y: offsetY });
    }
  };

  useEffect(() => {
    if (workerImage.current) {
      workerImage.current.style.transform = `translate(${iOffset.x}px, ${iOffset.y}px)`;
    }
  }, [iOffset]);

  return (
    <div
      style={{
        width: '100%',
        height: 'fit-contents',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2 style={{ margin: '0.5rem 0 1rem 0' }}>위반 사진</h2>
      <img
        css={IssueImageStyle}
        src={`https://kr.object.ncloudstorage.com/detec/report/${reportid}.jpg`}
        alt=""
        onMouseEnter={() => {
          setWi(true);
        }}
        onMouseMove={mouseMoveHandler}
        onMouseLeave={() => {
          setWi(false);
        }}
      />
      <IssueWorkerImageDiv open={wi} ref={workerImage}>
        <IssueWorkerImage reportid={reportid} />
      </IssueWorkerImageDiv>
    </div>
  );
}

export default IssueImage;

const IssueImageStyle = css`
  width: 100%;
  max-width: 350px;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

const IssueWorkerImageDiv = styled.div<{ open: boolean }>`
  position: absolute;
  display: ${props => (props.open ? 'block' : 'none')};

  z-index: 1000;
`;
