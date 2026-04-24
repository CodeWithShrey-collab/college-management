package com.example.Spring_Boot_JPA.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.validation.constraints.NotNull;

@Setter
@Getter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDto {

    @NotNull
    @JsonProperty("course_id")
    private String id;

    @JsonProperty("course_name")
    private String name;

    @JsonProperty("course_description")
    private String description;
}
