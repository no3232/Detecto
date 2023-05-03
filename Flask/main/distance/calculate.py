import cv2
import numpy as np
import math
from main.tools.cloud import cloud
from ..repository.repository import Report, ReportItem
from ...main.app import app
from ..tools.database import db
from datetime import datetime
import os

real_object_height = 23.6
focal_length = 800
pro = set({1, 2, 3, 6, 7})


def calculate_distance(real_height, focal_length, image_height):
    return (real_height * focal_length) / image_height


def calculate(imglist, model):
    j = 1
    distance = np.zeros((5))
    person = set([])
    for tmp in imglist:
        img = cv2.imread(tmp)
        img = cv2.resize(img, (640, 640))
        results = model(img, conf=0.5)
        annotated_frame = results[0].plot()
        
        i = 0
        h = 0
        for classs in results[0].boxes.cls:
            if int(classs.item()) in pro:
                person.add(int(classs.item()))
        
            if int(classs.item()) == 7 or int(classs.item()) == 9:
                h = (results[0].boxes.boxes[i][3] - results[0].boxes.boxes[i][1]).item()
                distance[j] = calculate_distance(real_object_height, focal_length, h)
                continue
            i = i + 1
        j += 1

    current_time = datetime.utcnow()
    

    arr = np.zeros((100, 83), dtype=np.int32)
    for i in range(16,27):
        for j in range(19,48):
            arr[i][j] = -1

    for i in range(27,55):
        for j in range(57,59):
            arr[i][j] = -1 
    for i in range(91,100):
        for j in range(0,12):
            arr[i][j] = -1
    center_x = [0,0,0,99,99,0]
    center_y = [0,0,82,11,82,0]
    
    i, j = np.meshgrid(np.arange(100), np.arange(84), indexing="ij")
    for k in range(1, 5):
        if distance[k] == 0:
            continue
        mask = (
            np.sqrt((center_x[k] - i) ** 2 + (center_y[k] - j) ** 2)
            <= int(distance[k] / 10) + 20
        ) & (arr != -1)
        arr[mask] = arr[mask] + 1
    visualize_arr = np.zeros((100, 84, 3), dtype=np.uint8)

    mask_1 = arr == 1
    mask_2 = arr == 2
    mask_3 = arr == 3
    mask_4 = arr == 4
    visualize_arr[mask_1] = (55, 55, 55)
    visualize_arr[mask_2] = (100, 100, 100)
    visualize_arr[mask_3] = (175, 175, 175)
    visualize_arr[mask_4] = (255, 255, 255)

    coords = np.argwhere(arr == 4)
    mean_coord = np.mean(coords, axis=0)
    if math.isnan(mean_coord[0]):
        coords = np.argwhere(arr == 3)
        mean_coord = np.mean(coords, axis=0)
    if math.isnan(mean_coord[0]):
        coords = np.argwhere(arr == 2)
        mean_coord = np.mean(coords, axis=0)
    if math.isnan(mean_coord[0]):
        coords = np.argwhere(arr == 1)
        mean_coord = np.mean(coords, axis=0)
    if math.isnan(mean_coord[0]):
        mean_coord = [50,42]    
    scale = 5
    resized_visualize_arr = cv2.resize(
        visualize_arr, (83 * scale, 100 * scale), interpolation=cv2.INTER_NEAREST
    )
    cv2.imwrite("debug.jpg", resized_visualize_arr)

    if len(person) != 0:
        id = 0
        with app.app_context():
            new_report = Report(user_id=-1, time=current_time, x=int(mean_coord[0]), y=int(mean_coord[1]))
            db.session.add(new_report)
            db.session.flush()  
            id = new_report.id
            db.session.commit()
        
            object_storage = cloud().client
            object_storage.put_bucket_acl(Bucket="detec", ACL='public-read')
            i = 1
            for img in imglist:
                filename = f"{current_time}.jpg"
                cv2.imwrite(filename, annotated_frame)
                local_file_path = os.path.abspath(filename)
                object_storage.upload_file(local_file_path, "detec", "report/"+str(id)+"/"+str(i)+".jpg", ExtraArgs={'ACL': 'public-read'})
                i = i+1
            for thing in person:
                new_report = ReportItem(item=thing,report_id=id)
                db.session.add(new_report)
            db.session.commit()
    return [int(mean_coord[0]),int(mean_coord[1])]