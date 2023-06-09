package com.example.detecto.data;

import com.example.detecto.entity.enums.ErrorEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Data
@AllArgsConstructor
public class RespData<T> {
    String flag;
    String msg;
    int code = 0;
    T data;

    public RespData() {
        this.flag = "success";
        this.msg = "";
        this.code = 0;
    }

    public RespData(ErrorEnum error) {
        this.flag = error.flag;
        this.msg = error.msg;
        this.code = error.code;
        this.data = null;
    }

    public ResponseEntity<?> builder(){
        return new ResponseEntity<RespData>(this, HttpStatus.OK);
    }

    public ResponseEntity<?> exceptionBuilder(){
        return new ResponseEntity<RespData>(this, HttpStatus.BAD_REQUEST);
    }
}

