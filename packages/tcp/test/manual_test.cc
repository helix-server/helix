#include "tcp_server.hpp"
#include <iostream>
#include <memory>

int main() {
    std::cout << "Testing TCP Server..." << std::endl;
    
    // Test 1: Create server
    std::unique_ptr<helix::tcp::TcpServer> server(
        helix::tcp::create_server("127.0.0.1", 9090)
    );
    
    if (!server) {
        std::cerr << "Failed to create server" << std::endl;
        return 1;
    }
    std::cout << "✓ Server created successfully" << std::endl;
    
    // Test 2: Check configuration
    if (server->getAddress() != "127.0.0.1") {
        std::cerr << "Address mismatch" << std::endl;
        return 1;
    }
    if (server->getPort() != 9090) {
        std::cerr << "Port mismatch" << std::endl;
        return 1;
    }
    std::cout << "✓ Configuration correct" << std::endl;
    
    // Test 3: Check initial state
    if (server->isRunning()) {
        std::cerr << "Server should not be running initially" << std::endl;
        return 1;
    }
    std::cout << "✓ Initial state correct" << std::endl;
    
    // Test 4: Start server
    if (!server->start()) {
        std::cerr << "Failed to start server" << std::endl;
        return 1;
    }
    std::cout << "✓ Server started successfully" << std::endl;
    
    // Test 5: Check running state
    if (!server->isRunning()) {
        std::cerr << "Server should be running" << std::endl;
        return 1;
    }
    std::cout << "✓ Server is running" << std::endl;
    
    // Test 6: Stop server
    server->stop();
    if (server->isRunning()) {
        std::cerr << "Server should not be running after stop" << std::endl;
        return 1;
    }
    std::cout << "✓ Server stopped successfully" << std::endl;
    
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
