import { mobileV, tabletV } from '@/utils/Mixin'
import { Button, Input, TextField, css } from '@mui/material';
import styled from '@emotion/styled'
import React, { useEffect, useRef, useState } from 'react'
import DragAndDrop from './DragAndDrop';
import { getRandomNumber } from '@/utils/RandomDataGenerator';


type EditEquipmentProps = {
  addItemHandler: (name: string, desc: string, img: string) => void,
  onClose: () => void
}

function EditEquipment({ addItemHandler, onClose }: EditEquipmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedZip, setSelectedZip] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentDesc, setEquipmentDesc] = useState("");
  const [isErrorName, setIsErrorName] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageSrc, setImageSrc] = useState(null);

  const submit = () => {
    console.log(equipmentName, equipmentDesc);
    const randomImgURL = `https://unsplash.it/150/200?image=${getRandomNumber(1, 100)}`;
    if (imageSrc === null) {
      console.log("null 잼");
    }
    addItemHandler(equipmentName, equipmentDesc, imageSrc);
    onClose()
  }

  const handleNameinput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    if (name === "") {
      setIsErrorName(true);
      setErrorMessage("장비명을 입력해주세요");
      setIsValid(false);
    } else if (name.length > 20) {
      setIsErrorName(true);
      setErrorMessage("장비명은 20자 이하로 입력해주세요");
      setIsValid(false);
    } else {
      setIsErrorName(false);
      setErrorMessage(" ");
    }
    setEquipmentName(name);
  }

  const handleDescinput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEquipmentDesc(e.target.value);
  }

  useEffect(() => {
    if (selectedZip !== null && equipmentName.trim() !== "") {
      setIsValid(true);
    }
  }, [equipmentName, selectedZip])
  
  useEffect(() => {
    if (selectedImage && selectedImage.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        console.log("변환하기: ", e.target?.result);
        
        setImageSrc(e.target?.result);
      }
      reader.readAsDataURL(selectedImage);
    } else {
      setImageSrc(null);
    }
  }, [selectedImage])

  return (
    <EditEquipmentForm>
      <div>
        <DragAndDrop isDragging={isDragging} setIsDragging={setIsDragging} selectedFile={selectedZip} setSelectedFile={setSelectedZip} type='zip' />
        <br />
        <DragAndDrop isDragging={isDragging} setIsDragging={setIsDragging} selectedFile={selectedImage} setSelectedFile={setSelectedImage} type='image' />
        <TextField fullWidth label="장비명(공백제외 최대 20자)" variant="standard" onChange={handleNameinput} margin="normal" error={isErrorName} helperText={errorMessage} />
        <TextField fullWidth label="장비 설명(선택)" variant="standard" onChange={handleDescinput} />
      </div>
      <Button fullWidth variant="contained" onClick={submit} disabled={!isValid}>등록하기</Button>
    </EditEquipmentForm>
  )
}

const EditEquipmentForm = styled.form`
  width: 500px;
  height: 800px;
  background-color: ${props => props.theme.palette.neutral.main};
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const previewUploadStyle = css`
  width: 100%;
  height: 250px;
  border-radius: 10px;
  border: 2px dashed gray;
  margin-top: 10px;
`

export default EditEquipment