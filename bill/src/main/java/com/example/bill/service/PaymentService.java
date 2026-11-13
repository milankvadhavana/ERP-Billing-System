package com.example.bill.service;

import com.example.bill.model.Customer;
import com.example.bill.model.Invoice;
import com.example.bill.model.Payment;
import com.example.bill.repository.CustomerRepository;
import com.example.bill.repository.InvoiceRepository;
import com.example.bill.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private CustomerRepository customerRepository;

    public Payment addPayment(Payment payment) {
        if (payment.getDate() == null) payment.setDate(LocalDate.now());
        
        // Find customer to save name
        Customer c = customerRepository.findById(payment.getCustomerId()).orElse(null);
        if (c != null) payment.setCustomerName(c.getOrganizationName());

        return paymentRepository.save(payment);
    }

    // Aggregates billing data for the dashboard
    public List<Map<String, Object>> getDashboardData() {
        List<Customer> customers = customerRepository.findAll();
        List<Invoice> invoices = invoiceRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Map<String, Object>> dashboard = new ArrayList<>();

        for (Customer c : customers) {
            double totalInvoiced = 0;
            double totalPaid = 0;

            // Calculate from Invoices (Amount Paid within invoice)
            for (Invoice inv : invoices) {
                if (inv.getCustomerId().equals(c.getId())) {
                    totalInvoiced += inv.getTotalAmount();
                    totalPaid += inv.getAmountPaid();
                }
            }

            // Add standalone payments
            for (Payment p : payments) {
                if (p.getCustomerId().equals(c.getId())) {
                    totalPaid += p.getAmount();
                }
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("organizationName", c.getOrganizationName());
            map.put("mobileNumber", c.getMobileNumber());
            map.put("totalInvoiced", totalInvoiced);
            map.put("totalPaid", totalPaid);
            map.put("outstanding", totalInvoiced - totalPaid);
            
            dashboard.add(map);
        }
        return dashboard;
    }
}