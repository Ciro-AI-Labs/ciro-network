# Contributing to CIRO Network

Thank you for your interest in contributing to CIRO Network! 🚀

CIRO Network is building the future of decentralized GPU compute infrastructure,
and we welcome contributions from developers, researchers, and community members
who share our vision of democratizing AI compute resources.

## 🌟 How to Contribute

There are many ways to contribute to CIRO Network:

- **Code Contributions**: Smart contracts, worker node implementation, desktop
  applications, backend services
- **Documentation**: Improve guides, tutorials, API documentation, and technical
  specifications
- **Testing**: Help us test new features, report bugs, and improve reliability
- **Community**: Answer questions, help new contributors, and participate in
  discussions
- **Research**: Contribute to our understanding of distributed systems, DePIN,
  and GPU optimization

## 🚀 Getting Started

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/ciro-network.git
cd ciro-network

# Add the original repository as upstream
git remote add upstream https://github.com/ciro-ai-labs/ciro-network.git
```

### 2. Set Up Development Environment

We use DevContainers for consistent development environments:

```bash
# Open in VSCode with DevContainer
code .
# Select "Reopen in Container" when prompted

# Or set up manually following our guide
open docs/development-setup.md
```

### 3. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Keep your branch up to date
git fetch upstream
git rebase upstream/main
```

## 📋 Contribution Guidelines

### Code Standards

We maintain high code quality standards across all languages:

- **Rust**: Follow
  [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/) and our
  [Rust Style Guide](docs/code-standards/rust.md)
- **JavaScript/TypeScript**: Use ESLint, Prettier, and follow our
  [JS/TS Style Guide](docs/code-standards/javascript.md)
- **Cairo**: Follow
  [Cairo Style Guide](https://docs.starknet.io/documentation/architecture_and_concepts/Cairo_on_Starknet/cairo_style_guide/)
  and our [Cairo Standards](docs/code-standards/cairo.md)

### Security Requirements

Security is paramount in our project. Please review our
[Security Guidelines](docs/security/secure-coding.md) and ensure:

- All inputs are validated and sanitized
- No secrets are hardcoded
- Proper error handling is implemented
- Security tests are included
- Third-party dependencies are audited

### Testing Requirements

All contributions must include appropriate tests:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Security Tests**: Test for common vulnerabilities
- **Performance Tests**: Test scalability and efficiency

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:rust
npm run test:cairo
npm run test:js
```

### Documentation Requirements

Code contributions must include:

- **Inline Documentation**: Document public APIs and complex logic
- **README Updates**: Update relevant README files
- **Changelog Entries**: Add entries to CHANGELOG.md
- **User Guide Updates**: Update user-facing documentation

## 🔄 Development Workflow

### Branch Strategy

We use a feature branch workflow:

- **`main`**: Production-ready code, protected branch
- **`develop`**: Integration branch for features
- **`feature/*`**: Individual feature branches
- **`hotfix/*`**: Critical bug fixes
- **`release/*`**: Release preparation branches

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test-related changes
- `chore`: Maintenance tasks

**Examples:**

```
feat(worker): implement GPU utilization monitoring
fix(contracts): resolve overflow in stake calculation
docs(api): update REST API documentation
test(node): add integration tests for P2P networking
```

### Pull Request Process

1. **Create Pull Request**
   - Use our PR template
   - Provide clear description of changes
   - Link to related issues
   - Include screenshots/demos for UI changes

2. **Code Review**
   - All PRs require at least one review
   - Address feedback promptly
   - Keep discussions respectful and constructive

3. **Automated Checks**
   - CI/CD pipeline must pass
   - Security scans must pass
   - Code coverage must not decrease

4. **Merge Requirements**
   - All conversations resolved
   - Approved by maintainers
   - Up-to-date with target branch

## 🧪 Testing Your Changes

### Local Testing

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Build project
npm run build

# Run security checks
npm run security:check
```

### Integration Testing

```bash
# Start development environment
npm run dev:start

# Run integration tests
npm run test:integration

# Test documentation
npm run test:docs
```

## 🐛 Reporting Issues

### Bug Reports

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug-report.md) and include:

- **Environment**: OS, versions, configuration
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Additional Context**: Logs, error messages

### Feature Requests

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature-request.md)
and include:

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: Your suggested approach
- **Alternatives**: Other approaches considered
- **Implementation Notes**: Technical considerations
- **Acceptance Criteria**: How to validate success

### Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email <security@ciro.ai> with details
2. Use our [Security Policy](SECURITY.md) process
3. Allow time for responsible disclosure

## 💬 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please
review our [Code of Conduct](CODE_OF_CONDUCT.md) and:

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Report unacceptable behavior

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time community chat
- **Twitter**: [@CiroNetwork](https://twitter.com/CiroNetwork)
- **Email**: <team@ciro.ai>

## 🎯 Contribution Areas

### High Priority Areas

- **Smart Contract Security**: Audit and improve Cairo contracts
- **Worker Node Performance**: Optimize GPU utilization and networking
- **Desktop Application**: Cross-platform compatibility and UX
- **Documentation**: User guides and developer resources
- **Testing**: Automated testing and quality assurance

### Good First Issues

New contributors should look for issues labeled:

- `good-first-issue`: Perfect for newcomers
- `help-wanted`: Community contributions welcome
- `documentation`: Documentation improvements needed

### Advanced Contributions

Experienced contributors can tackle:

- `epic`: Large features requiring design discussion
- `performance`: Optimization and scalability improvements
- `security`: Security hardening and auditing
- `research`: Algorithmic improvements and research

## 🏆 Recognition

We value all contributions and recognize them through:

- **Contributors List**: README.md acknowledgments
- **Release Notes**: Feature contribution credits
- **Community Highlights**: Social media recognition
- **Maintainer Invitations**: For consistent, high-quality contributions

## 📚 Resources

### Documentation

- [Architecture Overview](docs/architecture/)
- [API Documentation](docs/api/)
- [Development Setup](docs/development-setup.md)
- [Code Standards](docs/code-standards/)
- [Security Guidelines](docs/security/)

### Learning Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet Documentation](https://docs.starknet.io/)
- [DePIN Resources](docs/resources/depin.md)

### Tools and Libraries

- [Rust Ecosystem](docs/resources/rust-ecosystem.md)
- [Cairo Ecosystem](docs/resources/cairo-ecosystem.md)
- [Development Tools](docs/resources/development-tools.md)

## ❓ Getting Help

If you need help:

1. **Check Documentation**: Start with our comprehensive docs
2. **Search Issues**: Your question might already be answered
3. **Ask in Discussions**: Use GitHub Discussions for questions
4. **Join Discord**: Real-time help from the community
5. **Contact Maintainers**: For urgent or complex issues

## 🔄 Continuous Improvement

We continuously improve our contribution process:

- **Feedback Welcome**: Tell us how to improve this guide
- **Process Updates**: We regularly review and update processes
- **Tool Integration**: We adopt new tools to improve developer experience
- **Community Input**: Major changes are discussed with the community

## 🙏 Thank You

Every contribution, no matter how small, helps make CIRO Network better. Whether
you're fixing a typo, adding a feature, or helping other contributors, you're
part of building the future of decentralized AI infrastructure.

Together, we're making high-performance GPU compute accessible to everyone.
Welcome to the CIRO Network community! 🚀

---

_This contributing guide is a living document. Help us improve it by
[submitting suggestions](https://github.com/ciro-ai-labs/ciro-network/issues/new?template=documentation-improvement.md)._

**Last updated:** January 2025  
**Next review:** March 2025
