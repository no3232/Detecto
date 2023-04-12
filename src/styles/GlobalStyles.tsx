import { Global, css } from '@emotion/react'
import React from 'react'

function GlobalStyles() {
  return (
    <Global styles={styles} />
  )
}

const styles = css`
  * {
    margin: 0;
    padding: 0;
    text-decoration: none;
    box-sizing: border-box;
    font-family: "Pretendard";
  }
`

export default GlobalStyles