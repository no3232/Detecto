import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Tabs, Tab, Box, Paper, css } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { koKR } from '@mui/x-date-pickers/locales';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useRecoilState } from 'recoil';
import { DashboardDayAtom } from '@/store/DashboardFilter';
import dayjs, { Dayjs } from 'dayjs';
import {
  RestartAlt,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { mobileV } from '@/utils/Mixin';

// (향후 날짜, 기간 DatePicker 세부 컴포넌트로 추출 예정)

function DashboardDatePicker() {
  // 모바일 드롭다운 State
  const [mobileOpen, setMobileOpen] = useState(false);

  // MUI 탭 State
  const [tabValue, setTabValue] = useState<number>(0);

  // 날짜 지정 Recoil State
  const [date, setDate] = useRecoilState(DashboardDayAtom);

  // MUI 탭 onChange
  const tabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const resetFilterDay = () => {
    setDate({ startDay: dayjs(), endDay: dayjs() });
  };

  return (
    <DatePaper>
      {/* 모바일에서 클릭 시 드롭다운 open/close */}
      <DateHeaderDiv
        onClick={() => {
          setMobileOpen(prev => !prev);
        }}
      >
        <div>
          {mobileOpen ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          날짜 선택
        </div>
        <Button
          onClick={e => {
            e.stopPropagation();
            resetFilterDay();
          }}
        >
          <span>현재 날짜</span>
          <RestartAlt color="primary" />
        </Button>
      </DateHeaderDiv>
      {/* mobileopen props를 통해 모바일에서 드롭다운 표시 */}
      {/* 모바일이 아닐 경우 항상 표시 됨 */}
      <DateContentDiv mobileopen={mobileOpen}>
        <TabBox>
          <Tabs value={tabValue} onChange={tabChange}>
            <Tab label="기간 선택" value={0} />
            <Tab label="날짜 선택" value={1} />
          </Tabs>
          {/* 탭 패널 */}
          <div hidden={tabValue !== 0}>
            <TabPanelDiv>
              <LocalizationProvider dateAdapter={AdapterDayjs} localeText={koKR.components.MuiLocalizationProvider.defaultProps.localeText}>
                <DatePicker
                  label="시작 날짜"
                  format="YYYY.MM.DD"
                  value={date.startDay}
                  maxDate={date.endDay}
                  onChange={(newValue: Dayjs | null) => {
                    setDate(prev => {
                      return { ...prev, startDay: newValue || dayjs() };
                    });
                  }}
                  css={DatePickerCSS}
                  slotProps={{
                    toolbar: { toolbarFormat: 'YYYY.MM.DD', hidden: false },
                  }}
                  
                />
                <DatePicker
                  label="끝 날짜"
                  format="YYYY.MM.DD"
                  value={date.endDay}
                  minDate={date.startDay}
                  maxDate={dayjs()}
                  onChange={(newValue: Dayjs | null) => {
                    setDate(prev => {
                      return { ...prev, endDay: newValue || dayjs() };
                    });
                  }}
                  css={DatePickerCSS}
                />
              </LocalizationProvider>
            </TabPanelDiv>
          </div>
          <div hidden={tabValue !== 1}>
            <TabPanelDiv>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="날짜 선택"
                  format="YYYY.MM.DD"
                  value={date.startDay}
                  maxDate={dayjs()}
                  onChange={(newValue: Dayjs | null) => {
                    setDate({
                      startDay: newValue || dayjs(),
                      endDay: newValue || dayjs(),
                    });
                  }}
                  css={DatePickerCSS}
                />
              </LocalizationProvider>
            </TabPanelDiv>
          </div>
        </TabBox>
      </DateContentDiv>
    </DatePaper>
  );
}

export default DashboardDatePicker;

const DatePaper = styled(Paper)`
  width: 100%;
  padding: 1rem;
  margin: 1rem;

  transition: 0.2s all ease;
`;

const DateHeaderDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;
    align-items: center;
    svg {
      display: none;
    }
  }

  ${mobileV} {
    margin-bottom: 0;
    div {
      svg {
        display: block;
      }
    }
    button {
      span {
        display: none;
      }
    }
  }
`;

const DateContentDiv = styled.div<{ mobileopen: boolean }>`
  display: flex;

  ${mobileV} {
    display: ${props => (props.mobileopen ? 'block' : 'none')};
  }
`;

const TabBox = styled(Box)`
  width: '100%';
  margin-bottom: '1rem';
`;

const DatePickerCSS = css`
  margin: 10px;
`;

const TabPanelDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;
