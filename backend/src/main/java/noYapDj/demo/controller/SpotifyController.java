package noYapDj.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import noYapDj.demo.service.SpotifyAuthService;
import noYapDj.demo.service.SpotifyApiService;
import java.util.HashMap;
import java.util.Map;
//API controller
@RestController
//all endpoints start with /api
@RequestMapping("/api")
//react frontend
@CrossOrigin(origins = "http://localhost:3000")
public class SpotifyController {
    @Autowired
    private SpotifyAuthService authService;
    
    @Autowired
    private SpotifyApiService apiService;
    //redirect to spotify login
    @GetMapping("/login")
    public RedirectView login() {
        return new RedirectView(authService.getAuthorizationUrl());
    }
    //callback from spotify after login (the thing I put in)
    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> callback(@RequestParam String code) {
        String accessToken = authService.getAccessToken(code);
        Map<String, String> response = new HashMap<>();
        response.put("accessToken", accessToken);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    public ResponseEntity<String> search(
        @RequestParam String q,
        @RequestHeader("Authorization") String token) {
        String accessToken = token.replace("Bearer ", "");
        return ResponseEntity.ok(apiService.searchTrack(accessToken, q));
    }
    //get top tracks
    @GetMapping("/top-tracks")
    public ResponseEntity<String> getTopTracks(
        @RequestHeader("Authorization") String token) {
        String accessToken = token.replace("Bearer ", "");
        return ResponseEntity.ok(apiService.getTopTracks(accessToken));
    }
}