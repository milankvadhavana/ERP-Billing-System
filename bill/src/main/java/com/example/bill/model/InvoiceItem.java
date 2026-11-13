package com.example.bill.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItem {
    private String productId;
    private String productCode;
    private String productName;
    private Double price;
    private Integer quantity;
    private Double total;
}