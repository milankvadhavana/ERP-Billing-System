package com.example.bill.service;

import com.example.bill.model.Invoice;
import com.example.bill.model.InvoiceItem;
import com.example.bill.model.Product;
import com.example.bill.repository.InvoiceRepository;
import com.example.bill.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ProductRepository productRepository;

    public String generateNextInvoiceNo() {
        // Fetch all invoices to find the highest number
        List<Invoice> invoices = invoiceRepository.findAll();
        int maxNum = 0;

        for (Invoice inv : invoices) {
            if (inv.getInvoiceNo() != null && inv.getInvoiceNo().startsWith("INV-")) {
                try {
                    // Extract the numeric part (e.g., "0003" -> 3)
                    String numStr = inv.getInvoiceNo().replace("INV-", "");
                    int num = Integer.parseInt(numStr);
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (NumberFormatException e) {
                    // Ignore malformed invoice numbers
                }
            }
        }
        
        // Return the next highest number formatted as INV-000X
        return String.format("INV-%04d", maxNum + 1);
    }

    public Invoice saveInvoice(Invoice invoice) {
        // 1. Always generate a new unique invoice number on the backend for NEW invoices
        if (invoice.getId() == null) {
            invoice.setId(UUID.randomUUID().toString());
            // Override whatever the frontend sent with the safe, unique backend number
            invoice.setInvoiceNo(generateNextInvoiceNo()); 
        }
        
        if (invoice.getDate() == null) {
            invoice.setDate(LocalDate.now());
        }

        // 2. Update Stock
        for (InvoiceItem item : invoice.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                int newStock = product.getStockQty() - item.getQuantity();
                if (newStock < 0) newStock = 0; 
                product.setStockQty(newStock);
                productRepository.save(product);
            }
        }

        // 3. Recalculate totals
        double total = 0.0;
        for (InvoiceItem item : invoice.getItems()) {
            item.setTotal(item.getPrice() * item.getQuantity());
            total += item.getTotal();
        }
        invoice.setTotalAmount(total);
        invoice.setBalance(total - invoice.getAmountPaid());

        if (invoice.getAmountPaid() == 0) {
            invoice.setPaymentStatus("Unpaid");
        } else if (invoice.getAmountPaid() >= total) {
            invoice.setPaymentStatus("Paid");
        } else {
            invoice.setPaymentStatus("Partially Paid");
        }

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(String id) {
        return invoiceRepository.findById(id).orElse(null);
    }
    
    public List<Invoice> getCustomerLedger(String customerId) {
        return invoiceRepository.findByCustomerIdOrderByDateAsc(customerId);
    }
}