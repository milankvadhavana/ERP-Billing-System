<<<<<<< HEAD
=======

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
package com.example.bill.service;

import com.example.bill.dto.AuthResponse;
import com.example.bill.dto.LoginRequest;
import com.example.bill.dto.RegisterRequest;
import com.example.bill.model.User;
import com.example.bill.repository.UserRepository;
<<<<<<< HEAD
=======

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse register(RegisterRequest req) {
<<<<<<< HEAD
=======

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
<<<<<<< HEAD
        user.setPassword(req.getPassword()); // plain text for demo
=======
        user.setPassword(req.getPassword());
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
        user.setPhone(req.getPhone());

        User saved = userRepository.save(user);

<<<<<<< HEAD
        return new AuthResponse("Registration successful", saved.getId(), saved.getName(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
=======
        return new AuthResponse(
                "Registration successful",
                String.valueOf(saved.getId()),
                saved.getName(),
                saved.getEmail()
        );
    }

    public AuthResponse login(LoginRequest req) {

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(req.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

<<<<<<< HEAD
        return new AuthResponse("Login successful", user.getId(), user.getName(), user.getEmail());
    }
}
=======
        return new AuthResponse(
                "Login successful",
                String.valueOf(user.getId()),
                user.getName(),
                user.getEmail()
        );
    }
}
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
