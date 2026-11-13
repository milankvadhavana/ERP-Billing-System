<<<<<<< HEAD
package com.example.bill.repository;

import com.example.bill.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
=======

package com.example.bill.repository;

import com.example.bill.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
