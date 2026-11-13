package com.example.bill.controller;

import com.example.bill.model.Payment;
import com.example.bill.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/dashboard")
    public ResponseEntity<List<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(paymentService.getDashboardData());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addPayment(@RequestBody Payment payment) {
        try {
            return ResponseEntity.ok(paymentService.addPayment(payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add payment"));
        }
    }
}