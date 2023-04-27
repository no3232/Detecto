import cv2
import requests

class Camera():
    def __init__(self, cctvNum, flaskUrl):
        self.__camera_index = 0
        self.__cap = None
        self.__cctvNum = cctvNum
        self.__flaskUrl = flaskUrl

    # close camera
    def close_camera(self):
        print('[X] cam closed')
        self.__cap.release()
        cv2.destroyAllWindows()

    # open camera
    def capture(self, time):
        self.__cap = cv2.VideoCapture(self.__camera_index)
        # 웹캠에서 프레임 읽기
        if self.__cap.isOpened():
            ret, frame = self.__cap.read()
            if not ret:
                print('[X] no ret!')
                return

            print('capture!! ', time)

            frame = cv2.resize(frame, (640, 480))

            # 프레임 이미지를 flask 서버로 전송
            _, img_encoded = cv2.imencode('.jpg', frame)
            img_bytes = img_encoded.tobytes()
            files = {'file': ('image.jpg', img_bytes, 'image/jpeg')}
            data = {'id': self.__cctvNum, 'time': time}
            response = requests.post(
                self.__flaskUrl + '/upload', files=files, data=data)

            print(response)

            if response.status_code == 200:
                print('[O] 이미지 업로드 성공')
            else:
                print('[X] 이미지 업로드 실패', response.status_code)

    def main(self):
        try:
            self.__cap = cv2.VideoCapture(self.__camera_index)
            print('[*] Open camera', self.__cap)
            while True:
                if self.__cap.isOpened():
                    ret, frame = self.__cap.read()
                    if not ret:
                        print('[X] no ret!')

        finally:
            self.close_camera()
