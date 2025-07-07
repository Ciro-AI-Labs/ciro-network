# Secure Coding Guidelines for CIRO Network

## 🔒 Overview

This document outlines secure coding practices for the CIRO Network project. All contributors must follow these guidelines to ensure the security and integrity of our decentralized compute platform.

## 🛡️ General Security Principles

### 1. Defense in Depth

- **Multiple security layers**: Implement security at all levels (network, application, data)
- **Fail securely**: Ensure system fails to a secure state
- **Least privilege**: Grant minimal necessary permissions
- **Zero trust**: Verify all requests and users

### 2. Input Validation

- **Validate all inputs**: Never trust user input
- **Sanitize data**: Clean input before processing
- **Use allowlists**: Prefer allowlists over denylists
- **Proper encoding**: Encode output appropriately

### 3. Error Handling

- **Graceful failures**: Handle errors without exposing sensitive information
- **Structured logging**: Log security events appropriately
- **Avoid information leakage**: Don't expose internal details in error messages

## 🦀 Rust Security Guidelines

### Memory Safety

```rust
// ✅ DO: Use safe Rust features
fn safe_string_handling(input: &str) -> String {
    input.chars().filter(|c| c.is_alphanumeric()).collect()
}

// ❌ DON'T: Use unsafe code without careful review
unsafe fn dangerous_operation() {
    // Avoid unless absolutely necessary
}
```

### Input Validation

```rust
use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Debug, Deserialize, Validate)]
struct UserInput {
    #[validate(length(min = 1, max = 100))]
    #[validate(regex = "^[a-zA-Z0-9_]+$")]
    username: String,
    
    #[validate(email)]
    email: String,
    
    #[validate(range(min = 1, max = 120))]
    age: u8,
}

// ✅ DO: Always validate input
fn process_user_input(input: UserInput) -> Result<(), ValidationError> {
    input.validate()?;
    // Process validated input
    Ok(())
}
```

### Error Handling

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CiroError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Database error")]
    DatabaseError,  // Don't expose internal details
    
    #[error("Authentication failed")]
    AuthenticationError,
}

// ✅ DO: Use structured error handling
fn secure_function() -> Result<String, CiroError> {
    // Implementation
    Ok("success".to_string())
}
```

### Cryptography

```rust
use ring::{digest, rand, signature};
use ring::rand::SecureRandom;

// ✅ DO: Use established cryptographic libraries
fn generate_secure_random() -> [u8; 32] {
    let rng = rand::SystemRandom::new();
    let mut buffer = [0u8; 32];
    rng.fill(&mut buffer).expect("Failed to generate random bytes");
    buffer
}

// ✅ DO: Use constant-time comparisons for secrets
fn constant_time_compare(a: &[u8], b: &[u8]) -> bool {
    use subtle::ConstantTimeEq;
    a.ct_eq(b).into()
}
```

### Sensitive Data Handling

```rust
use zeroize::Zeroize;

#[derive(Zeroize)]
struct SensitiveData {
    secret_key: [u8; 32],
    password: String,
}

impl Drop for SensitiveData {
    fn drop(&mut self) {
        self.zeroize();
    }
}
```

## 🌐 JavaScript/TypeScript Security Guidelines

### Input Validation

```typescript
import { z } from 'zod';

// ✅ DO: Use schema validation
const UserSchema = z.object({
  username: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  age: z.number().min(1).max(120),
});

type User = z.infer<typeof UserSchema>;

function processUserInput(input: unknown): User {
  return UserSchema.parse(input); // Throws if invalid
}
```

### XSS Prevention

```typescript
// ✅ DO: Sanitize HTML content
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

// ✅ DO: Use proper encoding
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### Secret Management

```typescript
// ✅ DO: Use environment variables for secrets
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// ❌ DON'T: Hardcode secrets
const HARDCODED_SECRET = 'sk-1234567890abcdef'; // Never do this!
```

### HTTP Security

```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ✅ DO: Use security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ✅ DO: Implement rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api', limiter);
```

## 🏺 Cairo Smart Contract Security

### Access Control

```cairo
use starknet::ContractAddress;

#[starknet::interface]
trait IAccessControl<TContractState> {
    fn has_role(self: @TContractState, role: felt252, account: ContractAddress) -> bool;
    fn grant_role(ref self: TContractState, role: felt252, account: ContractAddress);
    fn revoke_role(ref self: TContractState, role: felt252, account: ContractAddress);
}

// ✅ DO: Implement proper access control
#[starknet::contract]
mod AccessControlContract {
    use super::IAccessControl;
    use starknet::{ContractAddress, get_caller_address};
    
    #[storage]
    struct Storage {
        roles: LegacyMap<(felt252, ContractAddress), bool>,
        admin: ContractAddress,
    }
    
    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        self.admin.write(admin);
    }
    
    #[external(v0)]
    impl AccessControlImpl of IAccessControl<ContractState> {
        fn has_role(self: @ContractState, role: felt252, account: ContractAddress) -> bool {
            self.roles.read((role, account))
        }
        
        fn grant_role(ref self: ContractState, role: felt252, account: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can grant roles');
            self.roles.write((role, account), true);
        }
        
        fn revoke_role(ref self: ContractState, role: felt252, account: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Only admin can revoke roles');
            self.roles.write((role, account), false);
        }
    }
}
```

### Integer Overflow Protection

```cairo
use starknet::contract_address::ContractAddress;

// ✅ DO: Use safe arithmetic operations
fn safe_add(a: u256, b: u256) -> u256 {
    let result = a + b;
    assert(result >= a, 'Addition overflow');
    result
}

// ✅ DO: Validate inputs
fn transfer_tokens(from: ContractAddress, to: ContractAddress, amount: u256) {
    assert(amount > 0, 'Amount must be positive');
    assert(from != to, 'Cannot transfer to self');
    // Implementation
}
```

### Reentrancy Protection

```cairo
#[starknet::contract]
mod ReentrancyGuard {
    #[storage]
    struct Storage {
        entered: bool,
    }
    
    #[constructor]
    fn constructor(ref self: ContractState) {
        self.entered.write(false);
    }
    
    fn non_reentrant_modifier(ref self: ContractState) {
        assert(!self.entered.read(), 'Reentrant call');
        self.entered.write(true);
    }
    
    fn end_non_reentrant(ref self: ContractState) {
        self.entered.write(false);
    }
}
```

## 🌐 Web3 Security Guidelines

### Private Key Management

```typescript
// ✅ DO: Use secure key storage
import { ethers } from 'ethers';

class SecureWallet {
  private wallet: ethers.Wallet;
  
  constructor(encryptedJson: string, password: string) {
    this.wallet = ethers.Wallet.fromEncryptedJson(encryptedJson, password);
  }
  
  // ❌ DON'T: Log or expose private keys
  getPrivateKey(): string {
    throw new Error('Private key access not allowed');
  }
}
```

### Transaction Validation

```typescript
// ✅ DO: Validate all transaction parameters
interface TransactionParams {
  to: string;
  value: bigint;
  gasLimit: bigint;
  gasPrice: bigint;
}

function validateTransaction(params: TransactionParams): boolean {
  // Validate recipient address
  if (!ethers.utils.isAddress(params.to)) {
    throw new Error('Invalid recipient address');
  }
  
  // Validate amounts
  if (params.value < 0n || params.gasLimit < 0n || params.gasPrice < 0n) {
    throw new Error('Invalid transaction amounts');
  }
  
  return true;
}
```

## 🔒 Security Checklists

### Pre-commit Checklist

- [ ] All inputs validated and sanitized
- [ ] No hardcoded secrets or API keys
- [ ] Proper error handling implemented
- [ ] Security tests written and passing
- [ ] Dependency vulnerabilities checked
- [ ] Code reviewed by another developer

### Smart Contract Checklist

- [ ] Access controls implemented
- [ ] Integer overflow protection
- [ ] Reentrancy guards where needed
- [ ] Input validation on all functions
- [ ] Events emitted for important operations
- [ ] Gas optimization considered
- [ ] Formal verification if critical

### API Security Checklist

- [ ] Authentication implemented
- [ ] Authorization checks in place
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention measures

## 🚨 Common Vulnerabilities to Avoid

### 1. Injection Attacks

```rust
// ❌ DON'T: String concatenation for SQL queries
let query = format!("SELECT * FROM users WHERE id = {}", user_id);

// ✅ DO: Use parameterized queries
let query = sqlx::query!("SELECT * FROM users WHERE id = ?", user_id);
```

### 2. Insecure Direct Object References

```typescript
// ❌ DON'T: Use predictable IDs
app.get('/user/:id', (req, res) => {
  const user = getUserById(req.params.id); // Anyone can access any user
  res.json(user);
});

// ✅ DO: Check authorization
app.get('/user/:id', authenticate, (req, res) => {
  const user = getUserById(req.params.id);
  if (user.id !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json(user);
});
```

### 3. Insecure Cryptographic Storage

```rust
// ❌ DON'T: Use weak hashing
use md5::{Digest, Md5};
let hash = Md5::digest(password.as_bytes());

// ✅ DO: Use strong hashing with salt
use argon2::{Argon2, password_hash::{PasswordHash, PasswordHasher, SaltString, PasswordVerifier}};
let salt = SaltString::generate(&mut thread_rng());
let argon2 = Argon2::default();
let hash = argon2.hash_password(password.as_bytes(), &salt).unwrap();
```

## 📚 Security Resources

### Tools and Libraries

- **Rust Security**: `cargo-audit`, `cargo-deny`, `clippy`
- **JavaScript Security**: `npm audit`, `snyk`, `eslint-plugin-security`
- **Cairo Security**: `scarb`, Cairo analyzer
- **General**: `git-secrets`, `trufflehog`, `semgrep`

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Rust Security Guidelines](https://doc.rust-lang.org/nomicon/)
- [Cairo Security Best Practices](https://docs.starknet.io/documentation/)
- [Web3 Security Guide](https://consensys.github.io/smart-contract-best-practices/)

### Training

- Regular security training sessions
- Code review participation
- Security conference attendance
- Capture The Flag (CTF) participation

## 🔄 Continuous Security

### Regular Activities

- Weekly dependency updates
- Monthly security audits
- Quarterly penetration testing
- Annual third-party security assessments

### Incident Response

1. **Immediate**: Contain and assess the threat
2. **Short-term**: Implement temporary mitigations
3. **Long-term**: Permanent fixes and process improvements
4. **Post-incident**: Review and update security measures

## 📞 Getting Help

If you have security questions or concerns:

- **General Questions**: #security channel in Discord
- **Vulnerability Reports**: Follow the process in SECURITY.md
- **Code Reviews**: Tag security team members
- **Training**: Contact the security training coordinator

Remember: **Security is everyone's responsibility!** 🛡️

---

*Last updated: January 2025*
*Next review: March 2025*
