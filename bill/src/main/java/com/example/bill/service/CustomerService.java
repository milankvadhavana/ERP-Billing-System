package com.example.bill.service;

import com.example.bill.model.Customer;
import com.example.bill.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Customer addCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // --- NEW: UPDATE LOGIC ---
    public Customer updateCustomer(String id, Customer updatedCustomer) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        existing.setOrganizationName(updatedCustomer.getOrganizationName());
        existing.setMobileNumber(updatedCustomer.getMobileNumber());

        return customerRepository.save(existing);
    }

    // --- NEW: DELETE LOGIC ---
    public void deleteCustomer(String id) {
        customerRepository.deleteById(id);
    }

    public void uploadBulkCustomers(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            List<Customer> customers = new ArrayList<>();
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                String[] data = line.split(",");
                if (data.length >= 2) {
                    Customer customer = new Customer();
                    customer.setOrganizationName(data[0].trim());
                    customer.setMobileNumber(data[1].trim());
                    customers.add(customer);
                }
            }
            customerRepository.saveAll(customers);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
    }
}