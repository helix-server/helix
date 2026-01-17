# Helix TCP Module

A C++ TCP server implementation for the Helix server framework. This module provides the foundational TCP layer that will be used to build HTTP protocol support.

## Overview

This module implements a basic TCP server in C++ with the goal of eventually supporting HTTP protocol. The library is designed to be exported as a Node.js/Bun addon.

## Structure

```
packages/tcp/
├── include/          # Header files
│   └── tcp_server.hpp
├── src/              # Implementation files
│   └── tcp_server.cc
├── test/             # Test files
│   ├── tcp_server_test.cc
│   └── manual_test.cc
├── BUILD             # Bazel build configuration
├── package.json
└── README.md
```

## Features

- **TCP Server Creation**: Factory function `create_server(address, port)` to create TCP server instances
- **Address Binding**: Bind to specific IP addresses (e.g., "127.0.0.1", "0.0.0.0")
- **Port Configuration**: Configure server to listen on any valid port
- **Server Lifecycle**: Start, stop, and check server status
- **Socket Options**: Automatic SO_REUSEADDR configuration
- **Error Handling**: Comprehensive error checking for socket operations

## API

### Main Function

```cpp
std::unique_ptr<TcpServer> create_server(const std::string& address, int port);
```

Creates a new TCP server instance.

**Parameters:**
- `address`: IP address to bind to (e.g., "127.0.0.1", "0.0.0.0")
- `port`: Port number to listen on

**Returns:** Unique pointer to a new `TcpServer` instance

### TcpServer Class

```cpp
class TcpServer {
public:
    // Start the server and begin listening for connections
    bool start();
    
    // Stop the server and close all connections
    void stop();
    
    // Check if the server is currently running
    bool isRunning() const;
    
    // Get the server address
    const std::string& getAddress() const;
    
    // Get the server port
    int getPort() const;
};
```

## Building

### Using Bazel (Recommended)

Build the library:
```bash
bazel build //packages/tcp:tcp_server
```

Run tests:
```bash
bazel test //packages/tcp:tcp_server_test
```

### Using g++ Directly

Compile the library:
```bash
g++ -std=c++17 -c -I./include src/tcp_server.cc -o tcp_server.o
```

Compile and run manual test:
```bash
g++ -std=c++17 -I./include src/tcp_server.cc test/manual_test.cc -o tcp_test
./tcp_test
```

## Testing

The module includes comprehensive unit tests using Google Test framework:

- Server creation and configuration
- Server lifecycle (start/stop)
- Multiple server instances
- Invalid address handling
- Port binding verification
- Running state management

Run tests with:
```bash
bazel test //packages/tcp:tcp_server_test
```

## Usage Example

```cpp
#include "tcp_server.hpp"

int main() {
    // Create a TCP server
    auto server = helix::tcp::create_server("127.0.0.1", 8080);
    
    // Start the server
    if (server->start()) {
        std::cout << "Server running on " 
                  << server->getAddress() << ":" 
                  << server->getPort() << std::endl;
        
        // Server is now listening for connections
        // ... handle connections ...
        
        // Stop the server
        server->stop();
    }
    
    return 0;
}
```

## Requirements

- C++17 or later
- POSIX-compliant system (Linux, macOS)
- Bazel for building (or g++ for manual compilation)
- Google Test for running unit tests

## Future Development

This TCP module is the foundation for HTTP protocol implementation. Planned features include:

1. Connection acceptance and management
2. HTTP request parsing
3. HTTP response generation
4. Keep-alive connection support
5. Node.js/Bun addon export

## License

MIT
