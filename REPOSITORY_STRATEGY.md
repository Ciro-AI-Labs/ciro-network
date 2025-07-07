# 🏗️ CIRO Network Repository Strategy

## Overview

This document outlines the strategic approach for organizing CIRO Network's
codebase across GitHub repositories to optimize development velocity, code
sharing, and team collaboration while maintaining the flexibility to scale
different components independently.

## 🎯 **Hybrid Strategy Rationale**

### Why Hybrid Works for DePIN Projects

DePIN (Decentralized Physical Infrastructure) projects like CIRO Network have
unique characteristics:

- **Tight Integration**: Smart contracts, worker nodes, and desktop apps must
  work seamlessly together
- **Diverse Teams**: Different expertise areas (Cairo, Rust, TypeScript,
  tokenomics)
- **Rapid Innovation**: Need to iterate quickly on core protocol
- **Specialized Components**: Some parts benefit from focused development

## 📦 **Repository Structure**

### 🏠 **Core Monorepo** (Primary Development)

**Repository**: `github.com/Ciro-AI-Labs/ciro-network`

```
ciro-network/
├── cairo-contracts/          # Smart contracts for Starknet
│   ├── src/                  # Contract implementations
│   ├── tests/                # Contract tests
│   └── scripts/              # Deployment scripts
├── rust-node/               # Worker node infrastructure
│   ├── src/                  # Node implementation
│   ├── docker/               # Container configurations
│   └── config/               # Node configurations
├── tauri-app/               # Desktop application
│   ├── src/                  # React frontend
│   ├── src-tauri/            # Rust backend
│   └── icons/                # App icons
├── backend/                 # API & backend services
│   ├── src/                  # Service implementations
│   ├── migrations/           # Database migrations
│   └── api/                  # API definitions
├── shared/                  # Common Rust libraries
│   ├── ciro-types/           # Type definitions
│   ├── ciro-crypto/          # Cryptographic utilities
│   ├── ciro-network/         # P2P networking
│   └── ciro-utils/           # Common utilities
├── docs/                    # Unified documentation
├── tests/                   # Integration tests
├── scripts/                 # Build & deployment scripts
└── .github/                 # CI/CD workflows
```

**Benefits**:

- ✅ **Unified CI/CD**: Single pipeline for all components
- ✅ **Shared Dependencies**: Easy version management
- ✅ **Atomic Commits**: Cross-component changes in one PR
- ✅ **Simplified Development**: One clone, unified tooling
- ✅ **Integration Testing**: Easy to test component interactions

**Challenges**:

- ⚠️ **Large Repository**: Longer clone times
- ⚠️ **Build Complexity**: Multiple toolchains
- ⚠️ **Permission Granularity**: Harder to restrict access by component

### 🎯 **Specialized Repositories**

#### 1. **Tokenomics & Research**

**Repository**: `github.com/Ciro-AI-Labs/ciro-tokenomics-simulator` ✅ _Already
exists_

```
ciro-tokenomics-simulator/
├── models/                  # Economic models
├── simulations/             # Simulation scripts
├── analysis/                # Data analysis notebooks
├── research/                # Research papers
└── tools/                   # Analysis tools
```

**Rationale**:

- Independent release cycles from core protocol
- Different stakeholders (economists, researchers)
- Sensitive economic models may need restricted access
- Heavy data files don't belong in main repo

#### 2. **Research & Documentation**

**Repository**: `github.com/Ciro-AI-Labs/ciro-research` 📚 _Recommended_

```
ciro-research/
├── papers/                  # Research papers
├── specifications/          # Protocol specifications
├── benchmarks/              # Performance benchmarks
├── case-studies/            # Real-world case studies
└── presentations/           # Conference materials
```

**Rationale**:

- Academic collaboration with external researchers
- Large PDF files and datasets
- Different review process than code
- Public visibility for thought leadership

#### 3. **Developer Examples & SDKs**

**Repository**: `github.com/Ciro-AI-Labs/ciro-examples` 🛠️ _Future_

```
ciro-examples/
├── quick-start/             # Getting started examples
├── integrations/            # Third-party integrations
├── sdk/                     # Software development kits
├── tutorials/               # Step-by-step guides
└── templates/               # Project templates
```

**Rationale**:

- Developer-focused content
- Independent from core development cycles
- Community contributions welcome
- Different testing/validation needs

#### 4. **Infrastructure & DevOps**

**Repository**: `github.com/Ciro-AI-Labs/ciro-infrastructure` ☁️ _Future_

```
ciro-infrastructure/
├── terraform/               # Infrastructure as Code
├── kubernetes/              # K8s manifests
├── monitoring/              # Observability configs
├── security/                # Security configurations
└── scripts/                 # Automation scripts
```

**Rationale**:

- Security-sensitive configurations
- DevOps team ownership
- Environment-specific variations
- Separate compliance requirements

#### 5. **Mobile Applications**

**Repository**: `github.com/Ciro-AI-Labs/ciro-mobile` 📱 _Future_

```
ciro-mobile/
├── ios/                     # iOS app
├── android/                 # Android app
├── shared/                  # Shared React Native code
└── assets/                  # Mobile-specific assets
```

**Rationale**:

- Different development team/skills
- Mobile-specific CI/CD requirements
- App store release cycles
- Large binary assets

## 🔄 **Development Workflow**

### **Phase 1: Current MVP Development** (Now)

**Primary Repo**: `ciro-network` (monorepo)

- Focus all development effort here
- Build core protocol, smart contracts, worker nodes
- Establish solid CI/CD and testing practices

**Secondary Repos**:

- `ciro-tokenomics-simulator` (continue independent development)

### **Phase 2: Team Scaling** (3-6 months)

**Add Specialized Repos**:

- `ciro-research` for academic collaboration
- `ciro-examples` for developer adoption
- Begin planning mobile strategy

**Keep Core Development** in monorepo for:

- Smart contracts
- Worker node
- Desktop app
- Backend services

### **Phase 3: Ecosystem Growth** (6-12 months)

**Expand Repository Strategy**:

- Launch mobile apps in dedicated repos
- Infrastructure repo for production operations
- Consider SDK/API-specific repos for partners

## 🚀 **Implementation Plan**

### **Immediate Actions** (This Week)

1. **Clean Up Current Monorepo**

   ```bash
   # Remove any unused components
   # Optimize .gitignore for large files
   # Document current structure in README
   ```

2. **Organize Tokenomics Repo**

   ```bash
   # Ensure ciro-tokenomics-simulator is up to date
   # Add proper documentation
   # Set up independent CI/CD
   ```

3. **Create Repository Guidelines**

   ```bash
   # Define when to create new repos
   # Establish naming conventions
   # Document cross-repo dependency management
   ```

### **Short Term** (Next Month)

1. **Set Up Repository Templates**
   - Create `.github` template repo
   - Standardize issue/PR templates
   - Unified security and contributing guidelines

2. **Improve Monorepo Tooling**
   - Optimize build caching
   - Improve CI/CD performance
   - Better component isolation in builds

3. **Plan Research Repository**
   - Identify research content to extract
   - Set up academic collaboration workflows
   - Plan for open-source research publication

### **Medium Term** (3-6 months)

1. **Create ciro-research Repository**
2. **Establish ciro-examples Repository**
3. **Plan Infrastructure Repository**
4. **Evaluate Mobile Development Strategy**

## 📋 **Repository Management Guidelines**

### **When to Create a New Repository**

✅ **Create New Repo When**:

- Component has independent release cycle
- Different team/stakeholder ownership
- Separate compliance/security requirements
- Large binary assets or datasets
- External collaboration needs
- Technology stack significantly different

❌ **Keep in Monorepo When**:

- Tight coupling with other components
- Shared build/test dependencies
- Frequent cross-component changes
- Small team working on multiple components
- Experimental/prototype phase

### **Cross-Repository Dependencies**

1. **Package Publishing**
   - Publish shared libraries to package registries
   - Use semantic versioning for all published packages
   - Automate package updates across repos

2. **Git Submodules** (Use Sparingly)
   - Only for stable, rarely-changing dependencies
   - Prefer package dependencies over submodules
   - Document submodule update procedures

3. **API Contracts**
   - Maintain API compatibility across repo boundaries
   - Use OpenAPI specs for HTTP APIs
   - Version all external interfaces

## 🔐 **Security & Access Control**

### **Repository Visibility**

- **Public Repos**: Research, examples, documentation
- **Private Repos**: Core protocol, infrastructure, sensitive configs
- **Restricted Access**: Tokenomics models, security configurations

### **Team Permissions**

```
Core Team: Full access to ciro-network monorepo
Research Team: Lead ciro-research, contribute to main
DevOps Team: Lead ciro-infrastructure, deploy access
Community: Contribute to examples, docs, research
```

## 📊 **Success Metrics**

### **Development Velocity**

- Time from idea to deployment
- Cross-team collaboration efficiency
- Developer onboarding time

### **Code Quality**

- Test coverage across repos
- Security vulnerability response time
- Documentation completeness

### **Community Growth**

- External contributions
- SDK adoption
- Research citations

## 🎯 **Recommendations Summary**

1. **Keep Current Monorepo** as primary development hub
2. **Maintain Separate Tokenomics Repo** for specialized work
3. **Add Research Repo** for academic collaboration
4. **Plan Specialized Repos** for scaling phases
5. **Optimize Monorepo Tooling** for better development experience
6. **Establish Clear Guidelines** for repo decisions

This strategy provides the flexibility to scale while maintaining the
integration benefits of a monorepo during critical MVP development phases.
