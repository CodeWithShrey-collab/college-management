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
public class StudentDto {

    @JsonProperty("student_id")
    @NotNull
    private String id;

    @JsonProperty("student_name")
    private String name;
}
