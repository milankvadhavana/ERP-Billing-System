package com.example.bill.controller;

import com.example.bill.dto.AuthResponse;
import com.example.bill.dto.LoginRequest;
import com.example.bill.dto.RegisterRequest;
import com.example.bill.service.UserService;
<<<<<<< HEAD
=======

>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
<<<<<<< HEAD
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
=======
@CrossOrigin(
    origins = "*",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.OPTIONS
    }
)
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
<<<<<<< HEAD
            return ResponseEntity.ok(userService.register(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
=======
            AuthResponse response = userService.register(req);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
<<<<<<< HEAD
            return ResponseEntity.ok(userService.login(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
=======
            AuthResponse response = userService.login(req);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
