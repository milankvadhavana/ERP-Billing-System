package com.example.bill.repository;

import com.example.bill.model.Product;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ProductRepository extends MongoRepository<Product, String> {
    boolean existsByProductCode(String productCode);
    
    @Query("{ '$expr': { '$lte': ['$stockQty', '$minStock'] } }")
    List<Product> findLowStockProducts();
}