package com.example.bill.service;

import com.example.bill.model.Product;
import com.example.bill.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product addProduct(Product product) {
        if (productRepository.existsByProductCode(product.getProductCode())) {
            throw new RuntimeException("Product Code already exists");
        }
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // --- NEW: UPDATE LOGIC ---
    public Product updateProduct(String id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if changing code to an existing one
        if (!existing.getProductCode().equals(updatedProduct.getProductCode()) &&
            productRepository.existsByProductCode(updatedProduct.getProductCode())) {
            throw new RuntimeException("Product Code already exists");
        }

        existing.setProductCode(updatedProduct.getProductCode());
        existing.setProductName(updatedProduct.getProductName());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQty(updatedProduct.getStockQty());
        existing.setMinStock(updatedProduct.getMinStock());

        return productRepository.save(existing);
    }

    // --- NEW: DELETE LOGIC ---
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public void uploadBulkProducts(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            List<Product> products = new ArrayList<>();
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                String[] data = line.split(",");
                if (data.length >= 3) {
                    Product p = new Product();
                    p.setProductCode(data[0].trim());
                    p.setProductName(data[1].trim());
                    p.setPrice(Double.parseDouble(data[2].trim()));
                    p.setStockQty(data.length > 3 ? Integer.parseInt(data[3].trim()) : 0);
                    p.setMinStock(data.length > 4 ? Integer.parseInt(data[4].trim()) : 5);
                    
                    if (!productRepository.existsByProductCode(p.getProductCode())) {
                        products.add(p);
                    }
                }
            }
            productRepository.saveAll(products);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
    }
}