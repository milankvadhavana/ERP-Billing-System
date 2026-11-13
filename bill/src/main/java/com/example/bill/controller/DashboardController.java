package com.example.bill.controller;

import com.example.bill.model.Customer;
import com.example.bill.model.Invoice;
import com.example.bill.model.Payment;
import com.example.bill.model.Product;
import com.example.bill.repository.CustomerRepository;
import com.example.bill.repository.InvoiceRepository;
import com.example.bill.repository.PaymentRepository;
import com.example.bill.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class DashboardController {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Invoice> allInvoices = invoiceRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();
        List<Customer> allCustomers = customerRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        

        // 1. Filter Invoices for the KPI Cards & Recent Table
        List<Invoice> filteredInvoices = allInvoices;
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            filteredInvoices = allInvoices.stream()
                .filter(inv -> !inv.getDate().isBefore(start) && !inv.getDate().isAfter(end))
                .collect(Collectors.toList());
        }

        // 2. Calculate Filtered Totals (For Top Cards)
        double filteredSales = 0;
        double filteredReceived = 0;

        for (Invoice inv : filteredInvoices) {
            filteredSales += inv.getTotalAmount();
            filteredReceived += inv.getAmountPaid();
        }
        // Add standalone payments within date range
        for (Payment pay : allPayments) {
            if (startDate != null && endDate != null) {
                LocalDate pDate = pay.getDate();
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                if (!pDate.isBefore(start) && !pDate.isAfter(end)) {
                    filteredReceived += pay.getAmount();
                }
            } else {
                filteredReceived += pay.getAmount();
            }
        }

        // 3. Calculate TRUE Top 5 Outstanding (All-Time, ignoring date filter)
        // This prevents ghost balances when a customer actually paid off their debt.
        List<Map<String, Object>> outstandingList = new ArrayList<>();
        for (Customer c : allCustomers) {
            double allTimeSales = 0;
            double allTimePaid = 0;

            // All invoices for this customer
            for (Invoice inv : allInvoices) {
                if (inv.getCustomerId().equals(c.getId())) {
                    allTimeSales += inv.getTotalAmount();
                    allTimePaid += inv.getAmountPaid();
                }
            }
            // All standalone payments for this customer
            for (Payment p : allPayments) {
                if (p.getCustomerId().equals(c.getId())) {
                    allTimePaid += p.getAmount();
                }
            }

            double trueOutstanding = allTimeSales - allTimePaid;
            if (trueOutstanding > 0) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", c.getOrganizationName());
                map.put("amount", trueOutstanding);
                outstandingList.add(map);
            }
        }
        
        // Sort by highest amount and take top 5
        outstandingList.sort((a, b) -> Double.compare((Double) b.get("amount"), (Double) a.get("amount")));
        List<Map<String, Object>> topOutstanding = outstandingList.stream().limit(5).collect(Collectors.toList());

        // 4. Recent Invoices (Filtered)
        filteredInvoices.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        List<Map<String, Object>> recentInvoices = filteredInvoices.stream().limit(5).map(inv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("invoiceNo", inv.getInvoiceNo());
            map.put("customerName", inv.getCustomerName());
            map.put("date", inv.getDate());
            map.put("totalAmount", inv.getTotalAmount());
            map.put("paymentStatus", inv.getPaymentStatus());
            return map;
        }).collect(Collectors.toList());
        
     // 5. Get Low Stock Alerts
         // Assuming you fetched this earlier for the count
        List<Map<String, Object>> lowStockAlerts = new ArrayList<>();

        for (Product p : allProducts) {
            if (p.getStockQty() <= p.getMinStock()) {
                Map<String, Object> alert = new HashMap<>();
                alert.put("name", p.getProductName());
                alert.put("stockQty", p.getStockQty());
                alert.put("isOutOfStock", p.getStockQty() == 0);
                lowStockAlerts.add(alert);
            }
        }
        // Sort so out-of-stock items appear first
        lowStockAlerts.sort((a, b) -> Boolean.compare((Boolean) b.get("isOutOfStock"), (Boolean) a.get("isOutOfStock")));

        return ResponseEntity.ok(Map.of(
            "totalSales", filteredSales,
            "totalReceived", filteredReceived,
            "totalOutstanding", filteredSales - filteredReceived, 
            "totalProducts", allProducts.size(),
            "topOutstanding", topOutstanding,
            "recentInvoices", recentInvoices,
            "lowStockAlerts", lowStockAlerts
        ));
    }
    
    
}