# Code Quality Standards

This document outlines the comprehensive code quality standards for the CIRO
Network project. We maintain **enterprise-grade quality** across all languages
and components.

## 🎯 **Quality Philosophy**

> _"Every line of code should be elegant, purposeful, and maintainable. This is
> a public repository where people will see our craftsmanship."_

### Core Principles

1. **Clarity over Cleverness** - Code should be self-documenting
2. **Consistency** - Follow established patterns and conventions
3. **Security First** - Every change considers security implications
4. **Performance Awareness** - Optimize for both speed and maintainability
5. **Cross-Platform Compatibility** - Support Windows, macOS, and Linux

## 🛠️ **Tools & Configuration**

### Universal Standards

- **EditorConfig** (`.editorconfig`) - Cross-editor consistency
- **Pre-commit Hooks** (`.husky/`) - Automated quality checks
- **CI/CD Integration** - Quality gates in GitHub Actions

### Language-Specific Tools

#### Rust

- **rustfmt** (`rustfmt.toml`) - Code formatting
- **Clippy** (`clippy.toml`) - Linting and best practices
- **cargo-audit** - Security vulnerability scanning
- **cargo-outdated** - Dependency freshness

#### JavaScript/TypeScript

- **ESLint** (`eslint.config.js`) - Linting with comprehensive rules
- **Prettier** (`prettier.config.js`) - Code formatting
- **TypeScript** (`tsconfig.json`) - Type checking
- **Security plugins** - Vulnerability detection

#### Cairo

- **Scarb** (`Scarb.toml`) - Cairo package manager and formatter
- **cairo-test** - Testing framework
- **Custom linting** - Project-specific rules (planned)

#### Markdown/Documentation

- **markdownlint** - Documentation consistency
- **mdBook** - Documentation generation
- **Prettier** - Markdown formatting

## 📝 **Style Guidelines**

### Rust Style

#### Naming Conventions

```rust
// ✅ DO: Use snake_case for functions and variables
fn process_gpu_task() -> TaskResult { }
let compute_nodes = vec![];

// ✅ DO: Use PascalCase for types and structs
struct ComputeNode {
    worker_id: WorkerId,
    gpu_specs: GpuSpecs,
}

// ✅ DO: Use SCREAMING_SNAKE_CASE for constants
const MAX_WORKERS_PER_NODE: usize = 16;
const DEFAULT_TIMEOUT_MS: u64 = 5000;
```

#### Documentation

````rust
/// Processes a GPU computation task on the CIRO network.
///
/// # Arguments
/// * `task` - The computation task to process
/// * `node_id` - The worker node identifier
///
/// # Returns
/// * `Ok(TaskResult)` - Successfully processed task
/// * `Err(TaskError)` - Processing failed
///
/// # Examples
/// ```
/// let result = process_task(task, node_id).await?;
/// ```
pub async fn process_task(task: Task, node_id: NodeId) -> Result<TaskResult, TaskError> {
    // Implementation
}
````

#### Error Handling

```rust
// ✅ DO: Use Result<T, E> for fallible operations
pub fn validate_worker_credentials(creds: &Credentials) -> Result<WorkerId, AuthError> {
    // Validation logic
}

// ✅ DO: Use custom error types
#[derive(Debug, thiserror::Error)]
pub enum NetworkError {
    #[error("Connection timeout: {timeout}ms")]
    Timeout { timeout: u64 },
    #[error("Invalid node ID: {id}")]
    InvalidNodeId { id: String },
}
```

### TypeScript/JavaScript Style

#### Naming Conventions

```typescript
// ✅ DO: Use camelCase for functions and variables
const processGpuTask = async (): Promise<TaskResult> => {};
const computeNodes: ComputeNode[] = [];

// ✅ DO: Use PascalCase for types and classes
interface ComputeNode {
  workerId: WorkerId;
  gpuSpecs: GpuSpecs;
}

class NetworkManager {
  private readonly nodeRegistry: NodeRegistry;
}

// ✅ DO: Use SCREAMING_SNAKE_CASE for constants
const MAX_WORKERS_PER_NODE = 16;
const DEFAULT_TIMEOUT_MS = 5000;
```

#### Type Definitions

```typescript
// ✅ DO: Use interfaces for object shapes
interface WorkerNode {
  readonly id: WorkerId;
  readonly gpuSpecs: GpuSpecs;
  readonly status: NodeStatus;
  lastHeartbeat: Date;
}

// ✅ DO: Use type aliases for unions and primitives
type NodeStatus = 'online' | 'offline' | 'maintenance';
type WorkerId = string;

// ✅ DO: Use generics for reusable types
interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly message?: string;
}
```

#### Function Documentation

````typescript
/**
 * Processes a GPU computation task on the CIRO network.
 *
 * @param task - The computation task to process
 * @param nodeId - The worker node identifier
 * @returns Promise resolving to task result
 * @throws NetworkError when connection fails
 * @throws ValidationError when task is invalid
 *
 * @example
 * ```typescript
 * const result = await processTask(task, nodeId);
 * console.log(`Task completed: ${result.id}`);
 * ```
 */
export async function processTask(
  task: Task,
  nodeId: NodeId
): Promise<TaskResult> {
  // Implementation
}
````

### Cairo Style

#### Contract Structure

```cairo
// ✅ DO: Use clear, descriptive contract names
#[starknet::contract]
mod CiroComputeRegistry {
    use starknet::ContractAddress;
    use ciro::types::{WorkerId, TaskId, ComputeSpecs};

    #[storage]
    struct Storage {
        workers: LegacyMap<WorkerId, ComputeSpecs>,
        task_assignments: LegacyMap<TaskId, WorkerId>,
        owner: ContractAddress,
    }

    // ✅ DO: Document all public functions
    /// Registers a new compute worker in the CIRO network
    ///
    /// # Arguments
    /// * `worker_id` - Unique identifier for the worker
    /// * `specs` - Hardware specifications of the worker
    ///
    /// # Panics
    /// * If worker already exists
    /// * If caller is not authorized
    #[external(v0)]
    fn register_worker(
        ref self: ContractState,
        worker_id: WorkerId,
        specs: ComputeSpecs
    ) {
        // Implementation
    }
}
```

## 🔧 **Development Workflow**

### Before Coding

1. **Understand the task** - Read task details thoroughly
2. **Plan the approach** - Consider architecture and patterns
3. **Research if needed** - Use `npm run research` for current best practices

### During Development

1. **Write tests first** - TDD when possible
2. **Commit frequently** - Small, logical commits
3. **Run quality checks** - `npm run quality`
4. **Document as you go** - Don't leave it for later

### Before Committing

1. **Format code** - `npm run format:all`
2. **Fix linting issues** - `npm run lint:all`
3. **Run all checks** - `npm run check:all`
4. **Test thoroughly** - `npm run test`
5. **Update documentation** - Keep docs in sync

### Pre-commit Hook (Automatic)

The following runs automatically on `git commit`:

```bash
# JavaScript/TypeScript files
eslint --fix
prettier --write

# Rust files
cargo fmt
cargo clippy --fix

# Markdown files
markdownlint --fix
prettier --write

# JSON/YAML files
prettier --write
```

## 🧪 **Testing Standards**

### Rust Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_worker_registration() {
        // Arrange
        let worker_id = WorkerId::new("worker_123");
        let specs = ComputeSpecs::default();

        // Act
        let result = register_worker(worker_id, specs);

        // Assert
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_async_task_processing() {
        // Test implementation
    }
}
```

### TypeScript Testing

```typescript
describe('NetworkManager', () => {
  let networkManager: NetworkManager;

  beforeEach(() => {
    networkManager = new NetworkManager();
  });

  test('should process valid task', async () => {
    // Arrange
    const task = createMockTask();
    const nodeId = 'node_123';

    // Act
    const result = await networkManager.processTask(task, nodeId);

    // Assert
    expect(result.status).toBe('completed');
  });
});
```

### Cairo Testing

```cairo
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_worker_registration() {
        let mut state = deploy_contract();
        let worker_id = 123_u256;
        let specs = ComputeSpecs { gpu_count: 4, memory_gb: 32 };

        state.register_worker(worker_id, specs);

        let registered_specs = state.get_worker_specs(worker_id);
        assert(registered_specs.gpu_count == 4, 'GPU count mismatch');
    }
}
```

## 📊 **Complexity Guidelines**

### Cognitive Complexity Limits

- **Functions**: Max 15 (configurable in tools)
- **Files**: Max 300 lines (consider splitting)
- **Modules**: Single responsibility principle

### Performance Considerations

- **Rust**: Prefer `&str` over `String` when possible
- **TypeScript**: Use `readonly` for immutable data
- **Cairo**: Minimize storage operations

## 🔒 **Security Standards**

### Input Validation

```rust
// ✅ DO: Validate all inputs
pub fn process_user_input(input: &str) -> Result<ProcessedInput, ValidationError> {
    if input.len() > MAX_INPUT_LENGTH {
        return Err(ValidationError::TooLong);
    }

    if !input.chars().all(|c| c.is_alphanumeric()) {
        return Err(ValidationError::InvalidCharacters);
    }

    Ok(ProcessedInput::new(input))
}
```

### Dependency Management

- **Regular updates** - Monitor for security patches
- **Audit tools** - `cargo audit`, `npm audit`
- **Minimal dependencies** - Only include what's necessary

## 📈 **Continuous Improvement**

### Code Reviews

- **All code reviewed** - No direct commits to main
- **Security focus** - Review with security mindset
- **Learning opportunity** - Share knowledge

### Metrics Tracking

- **Code coverage** - Aim for >80%
- **Performance benchmarks** - Track regressions
- **Documentation coverage** - All public APIs documented

### Regular Maintenance

- **Dependency updates** - Monthly security updates
- **Tool updates** - Keep formatters/linters current
- **Standard evolution** - Adapt to new best practices

## 🚀 **Quick Commands**

### Daily Development

```bash
# Format all code
npm run format:all

# Lint with auto-fix
npm run lint:all

# Run all quality checks
npm run quality

# Check without fixing
npm run check:all
```

### Setup (One-time)

```bash
# Install all tools
npm run setup

# Install git hooks
npm run setup:hooks
```

### CI/CD Commands

```bash
# Full test suite
npm test

# Production build
npm run build

# Security audit
cargo audit && npm audit
```

## 📚 **Resources**

- [Rust Style Guide](https://doc.rust-lang.org/nightly/style-guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Security Best Practices](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

**Remember**: Quality is not an accident. It's a deliberate choice we make with
every line of code.
