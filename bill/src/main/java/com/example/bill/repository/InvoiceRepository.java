package com.example.bill.repository;

import com.example.bill.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    Invoice findTopByOrderByIdDesc();
    
    // NEW: Find all invoices for a specific customer, ordered by date
    List<Invoice> findByCustomerIdOrderByDateAsc(String customerId); 
}