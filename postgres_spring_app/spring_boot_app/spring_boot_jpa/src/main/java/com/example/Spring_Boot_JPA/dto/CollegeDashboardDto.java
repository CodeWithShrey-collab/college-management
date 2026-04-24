package com.example.Spring_Boot_JPA.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Setter
@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeDashboardDto {

    @JsonProperty("project_name")
    private String projectName;

    @JsonProperty("project_description")
    private String projectDescription;

    @JsonProperty("student_count")
    private int studentCount;

    @JsonProperty("course_count")
    private int courseCount;
}
