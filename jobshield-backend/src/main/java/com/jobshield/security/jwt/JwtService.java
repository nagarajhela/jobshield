package com.jobshield.security.jwt;
import java.util.function.Function;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.jobshield.auth.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
@Service
public class JwtService {


    private static final String SECRET_KEY =
            "mySuperSecretKeyForJobShieldApplication123456789";

    private static final long EXPIRATION_TIME =
            1000 * 60 * 60 * 24; // 24 Hours
    public String generateToken(User user) {

        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

        return Jwts.builder()
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }
    
    public Claims extractClaims(String token) {

        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public boolean isTokenExpired(String token) {

        return extractClaims(token)
                .getExpiration()
                .before(new Date());

    }

public boolean isTokenValid(String token, UserDetails userDetails) {

    String email = extractUsername(token);

    return email.equals(userDetails.getUsername())
            && !isTokenExpired(token);

    }public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public <T> T extractClaim(String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extractClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }}