package com.jobshield.pdf;


import org.springframework.web.multipart.MultipartFile;

public interface PdfService {

    String extractText(MultipartFile file);

}