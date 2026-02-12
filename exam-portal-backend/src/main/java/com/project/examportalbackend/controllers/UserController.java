package com.project.examportalbackend.controllers;

import com.project.examportalbackend.models.User;
import com.project.examportalbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Base path relative to where the backend is running. 
    // Ideally this should be configured or pointing to an external storage service.
    // For this local setup, we'll try to save it directly to the frontend's public folder if possible, 
    // or a static folder served by backend. 
    // Given the constraints, saving to a "uploads" folder in the backend working directory 
    // and serving it as a static resource is a safer bet, but to make it immediately visible 
    // without backend static resource config changes, let's try to save to a known location.
    
    // Simplest approach: Save to a directory and serve it. 
    // Since we can't easily change backend static config without restart/more code, 
    // let's save to the Frontend's public/images folder if we can locate it, 
    // OR just save to a folder and let the user know.
    
    // BETTER APPROACH: Just return the base64 string? No, that's heavy.
    // Let's implement a download endpoint or serve static content. 
    
    // DECISION: Save to 'user-photos' directory in the working dir.
    
    private final String UPLOAD_DIR = "user-photos/";

    @PostMapping("/upload-profile-image/{userId}")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile multipartFile, @PathVariable Long userId) throws IOException {
        
        User user = userRepository.findById(userId).orElse(null);
        if(user == null) {
            return ResponseEntity.notFound().build();
        }

        String fileName = StringUtils.cleanPath(Objects.requireNonNull(multipartFile.getOriginalFilename()));
        // Make unique to prevent caching issues
        String uniqueFileName = userId + "_" + System.currentTimeMillis() + "_" + fileName;

        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try {
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(multipartFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            user.setProfileImage(uniqueFileName);
            userRepository.save(user);
            
            return ResponseEntity.ok(user);
        } catch (IOException ioe) {
            throw new IOException("Could not save image file: " + fileName, ioe);
        }
    }
    
    // Endpoint to verify username uniqueness (though registration handles it, this can be useful for async checks)
    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsername(@PathVariable String username) {
        User user = userRepository.findByUsername(username);
        return ResponseEntity.ok(user != null);
    }
}
