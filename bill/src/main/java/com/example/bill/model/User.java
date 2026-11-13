<<<<<<< HEAD
package com.example.bill.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
=======

package com.example.bill.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d

@Data
@NoArgsConstructor
@AllArgsConstructor
<<<<<<< HEAD
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password; // plain text for demo ONLY

    private String phone;
}
=======
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
}
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
