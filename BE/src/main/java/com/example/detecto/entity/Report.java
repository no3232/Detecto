package com.example.detecto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(of ={"id", "time", "x", "y"})
public class Report {

    @Id
    @GeneratedValue
    @Column(name = "id")
    private int id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime time;

    private int x;

    private int y;

    @JsonIgnore
    @OneToMany(mappedBy = "report", cascade = CascadeType.PERSIST, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReportItem> reportItems = new ArrayList<>();

    @Builder
    public Report(int x, int y){
        this.x = x;
        this.y = y;
        this.time = LocalDateTime.now();
    }

    public void setUser(User user){
        if(user.getReports().contains(this)){
            user.getReports().remove(this);
        }

        this.user = user;
        user.getReports().add(this);
    }

}


