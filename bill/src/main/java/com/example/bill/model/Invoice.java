package com.example.bill.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String invoiceNo;
    private LocalDate date;
    
    private String customerId;
    private String customerName;
    
    private List<InvoiceItem> items;
    
    private Double totalAmount;
    private Double amountPaid;
    private Double balance;
    private String paymentStatus; // Paid, Unpaid, Partially Paid
}