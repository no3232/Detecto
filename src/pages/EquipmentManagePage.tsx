import EquipmentCard from '@components/equipmentManage/EquipmentCard';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { EquipmentType } from 'EquipmentTypes';
import { useRecoilState } from 'recoil';
import { EquipmentsAtom } from '@/store/EquipmentStore';
import { getRandomBool, getRandomNumber, getRandomString } from '@/utils/RandomDataGenerator';

function EquipmentManagePage() {
  const [equipments, setEquipment] = useRecoilState(EquipmentsAtom);

  // 장비 삭제 핸들러: 카드로부터 ID를 입력받아 삭제한다
  const deleteHandler = (willDeleteID: number) => {
    setEquipment((oldState) => {
      return oldState.filter(item => item.id !== willDeleteID);
    })
  }

  // 장비 활성화 여부 토글링 핸들러: 카드로부터 ID를 입력받아 토글링한다
  const toggleHandler = (willToggleID: number) => {
    setEquipment((oldState) => {
      const newState = oldState.map(item => {
        const newItem = {...item};
        if (newItem.id === willToggleID) {
          newItem.isActive = !newItem.isActive;
        }
        return newItem;
      })
      return newState;
    })
  }

  const addItem = () => {
    /* (temp)더미 랜덤 데이터 생성 */
    const randomID = getRandomNumber(1, 10000000);
    const randomName = getRandomString(5);
    const randomDesc = getRandomString(10);
    const randomImgURL = `https://unsplash.it/150/200?image=${getRandomNumber(1, 1000)}`;
    const randomIsActive = getRandomBool();

    const newItem: EquipmentType = {
      id: randomID,
      name: randomName,
      desc: randomDesc,
      img: randomImgURL,
      isActive: randomIsActive
    }
    /* -------------------------- */
    
    setEquipment((oldState) => {
      return [...oldState, newItem];
    })
  }

  return (
    <EquipmentDiv>
      <h1>보호구 관리</h1>
      <EquipmentCardDiv>
        {equipments.map(equipment => <EquipmentCard key={equipment.id} equipment={equipment} onDelete={deleteHandler} onToggleAccessibility={toggleHandler} />)}
      </EquipmentCardDiv>
      <EquipmentAddButton variant="contained" onClick={addItem}>
        <AddCircleOutline />
      </EquipmentAddButton>
      <hr />
    </EquipmentDiv>
  );
}

export default EquipmentManagePage;

const EquipmentDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  margin: 1rem;
`;

const EquipmentCardDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  width: 100%;
`;

const EquipmentAddButton = styled(Button)`
  width: 80%;

  margin-bottom: 1rem;
  svg {
    font-size: 3rem;
  }
`;
