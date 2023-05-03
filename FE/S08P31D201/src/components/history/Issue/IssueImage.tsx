import React from 'react';
import { css } from '@emotion/react';

function IssueImage({violate_img}: {violate_img: string}) {
  return (
    <div
      style={{
        width: '100%',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>위반 사진</h2>
      <img css={IssueImageStyle} src={violate_img} alt="" />
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