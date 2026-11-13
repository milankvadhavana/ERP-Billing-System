package com.example.bill.controller;

import com.example.bill.model.Customer;
import com.example.bill.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/all")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCustomer(@RequestBody Customer customer) {
        try {
            return ResponseEntity.ok(customerService.addCustomer(customer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- NEW: UPDATE ENDPOINT ---
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable String id, @RequestBody Customer customer) {
        try {
            return ResponseEntity.ok(customerService.updateCustomer(id, customer));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- NEW: DELETE ENDPOINT ---
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable String id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete customer"));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBulk(@RequestParam("file") MultipartFile file) {
        try {
            customerService.uploadBulkCustomers(file);
            return ResponseEntity.ok(Map.of("message", "Bulk upload successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}