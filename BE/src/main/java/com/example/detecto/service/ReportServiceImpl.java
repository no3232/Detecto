package com.example.detecto.service;

import com.example.detecto.data.RespData;
import com.example.detecto.dto.ReportSearchDto;
import com.example.detecto.dto.ReportSearchResponseDto;
import com.example.detecto.dto.ReportSearchResponseTeamDto;
import com.example.detecto.dto.ReportSearchResponseUserDto;
import com.example.detecto.entity.Report;
import com.example.detecto.repository.ReportRepository;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.detecto.entity.QReport.*;
import static com.example.detecto.entity.QReportItem.*;
import static com.example.detecto.entity.QEquipment.*;
import static com.example.detecto.entity.QTeam.*;
import static com.example.detecto.entity.QUser.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final JPAQueryFactory queryFactory;
    private final ReportRepository reportRepository;

    @Override
    public RespData search(ReportSearchDto reportSearchDto) {

        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if(reportSearchDto.getStartDate() != null){
            LocalDate receivedDate = reportSearchDto.getStartDate();
            startDateTime = receivedDate.atTime(LocalTime.of(00, 00)); // 날짜에 원하는 시간을 추가 (예: 00시 00분)
        }
        if(reportSearchDto.getEndDate() != null){
            LocalDate receivedDate = reportSearchDto.getEndDate();
            endDateTime = receivedDate.atTime(LocalTime.of(23, 59)); // 날짜에 원하는 시간을 추가 (예: 23시 59분)
        }

        BooleanBuilder whereClause = new BooleanBuilder();

        if (startDateTime != null && endDateTime != null) {
            whereClause.and(report.time.between(startDateTime, endDateTime));
        }

        if (!reportSearchDto.getEquipments().isEmpty()) {
            whereClause.and(equipment.name.in(reportSearchDto.getEquipments()));
        }

        List<Report> reports = queryFactory
                .selectFrom(report)
                .leftJoin(report.user, user).fetchJoin()
                .leftJoin(user.team, team).fetchJoin()
                .leftJoin(report.reportItems, reportItem).fetchJoin()
                .leftJoin(reportItem.equipment, equipment).fetchJoin()
                .where(whereClause)
                .distinct()
                .fetch();

        for(Report report1 : reports){
            System.out.println(report1);
        }

        List<ReportSearchResponseDto> data = reports.stream().map(rd -> {
            ReportSearchResponseUserDto rs_user = new ReportSearchResponseUserDto(rd.getUser());
            ReportSearchResponseTeamDto rs_team = new ReportSearchResponseTeamDto(rd.getUser().getTeam());

            List<String> equipmentNames = rd.getReportItems().stream()
                    .map(item -> item.getEquipment().getName())
                    .collect(Collectors.toList());

            return new ReportSearchResponseDto(rd.getId(), rd.getTime(), rd.getX(), rd.getY(),
                    rs_user, rs_team, equipmentNames);
        }).collect(Collectors.toList());

        RespData result = RespData.builder()
                .flag(true)
                .data(data)
                .build();

        return result;
    }
}