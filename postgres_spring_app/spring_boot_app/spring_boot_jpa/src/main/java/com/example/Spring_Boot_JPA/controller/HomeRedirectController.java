package com.example.Spring_Boot_JPA.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeRedirectController {

    @GetMapping("/")
    public String redirectToCollegeHome() {
        return "forward:/index.html";
    }
}
