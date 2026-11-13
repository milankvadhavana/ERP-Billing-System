package com.example.bill.controller;

import com.example.bill.model.Invoice;
import com.example.bill.repository.InvoiceRepository;
import com.example.bill.repository.PaymentRepository;
import com.example.bill.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private InvoiceRepository invoiceRepository; 
    
    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/next-no")
    public ResponseEntity<?> getNextInvoiceNo() {
        return ResponseEntity.ok(Map.of("invoiceNo", invoiceService.generateNextInvoiceNo()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable String id) {
        Invoice inv = invoiceService.getInvoiceById(id);
        if (inv != null) return ResponseEntity.ok(inv);
        return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found"));
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveInvoice(@RequestBody Invoice invoice) {
        try {
            return ResponseEntity.ok(invoiceService.saveInvoice(invoice));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to save invoice: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable String id) {
        try {
            invoiceRepository.deleteById(id); // Assuming you inject InvoiceRepository or use a service method
            return ResponseEntity.ok(Map.of("message", "Invoice deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete invoice"));
        }
    }
    

    @GetMapping("/ledger/{customerId}")
    public ResponseEntity<?> getCustomerLedger(@PathVariable String customerId) {
        try {
            List<com.example.bill.model.Invoice> invoices = invoiceService.getCustomerLedger(customerId);
            List<com.example.bill.model.Payment> payments = paymentRepository.findByCustomerIdOrderByDateDesc(customerId);
            
            double totalInvoiced = 0;
            double totalPaid = 0;
            
            // Combine them into a single transaction list
            List<Map<String, Object>> transactions = new java.util.ArrayList<>();

            for (com.example.bill.model.Invoice inv : invoices) {
                totalInvoiced += inv.getTotalAmount();
                transactions.add(Map.of(
                    "date", inv.getDate(),
                    "reference", inv.getInvoiceNo(),
                    "type", "Invoice",
                    "description", "Sales Invoice",
                    "debit", inv.getTotalAmount(),
                    "credit", 0
                ));

                if (inv.getAmountPaid() > 0) {
                    totalPaid += inv.getAmountPaid();
                    transactions.add(Map.of(
                        "date", inv.getDate(),
                        "reference", "PAY-" + inv.getInvoiceNo().split("-")[1],
                        "type", "Payment",
                        "description", "Payment for " + inv.getInvoiceNo(),
                        "debit", 0,
                        "credit", inv.getAmountPaid()
                    ));
                }
            }

            for (com.example.bill.model.Payment p : payments) {
                totalPaid += p.getAmount();
                transactions.add(Map.of(
                    "date", p.getDate(),
                    "reference", "PAY-" + p.getId().substring(0, 4), // Dummy reference
                    "type", "Payment",
                    "description", p.getDescription() != null ? p.getDescription() : "Direct Payment",
                    "debit", 0,
                    "credit", p.getAmount()
                ));
            }

            // Sort by date
            transactions.sort((a, b) -> ((java.time.LocalDate) a.get("date")).compareTo((java.time.LocalDate) b.get("date")));

            return ResponseEntity.ok(Map.of(
                "transactions", transactions,
                "totalInvoiced", totalInvoiced,
                "totalPaid", totalPaid,
                "outstanding", totalInvoiced - totalPaid
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch ledger: " + e.getMessage()));
        }
    }
    
}