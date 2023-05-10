import os
import cv2
from datetime import datetime
from main.tools.cloud import cloud
from main.tools.database import db
from main.repository.repository import Report, ReportItem, Equipment

object_storage = cloud().client
object_storage.put_bucket_acl(Bucket="detec", ACL='public-read')

category = {
        "body" : 1,
        "arm" : 2,
        "hands" : 3,
        "face" : 4,
        "head": 5
    }
def save_non_wear(cctv_id,human_detect, yolo_image):
    equip = Equipment.query.all()
    current_time = datetime.utcnow()

    for human in human_detect:
        non_wearing_class = human_detect[human]
    # 미착용자 DB에 저장
        if len(non_wearing_class) != 0:
            id = 0
            # 위반 위치 레포트 저장
            new_report = Report(cctv_area=int(cctv_id),user_id=-1, time=current_time,
                                x=int(-1), y=int(-1))
            db.session.add(new_report)
            db.session.flush()

            id = new_report.id
            db.session.commit()

            # 위반 이미지 저장

            filename = f"{id}.jpg"
            cv2.imwrite(filename, yolo_image)
            local_file_path = os.path.abspath(filename)
            path = "report/" + str(id) + ".jpg"
            print(path)
            object_storage.upload_file(local_file_path, "detec", path, ExtraArgs={
                                        'ACL': 'public-read'})

            # 미착용 클래스
            print(equip)
            # 미착용 클래스 저장
            for i in range(len(non_wearing_class)):
                equip_name = equip[int(non_wearing_class[i])].name
                type = category[equip_name]
                result = db.session.query(Equipment).filter(Equipment.type == type, Equipment.able == 1).first()
                new_report = ReportItem(
                    equipment_name=result.name, report_id=id)
                db.session.add(new_report)

            db.session.commit()
