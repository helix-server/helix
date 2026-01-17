#ifndef HELIX_TCP_SERVER_HPP
#define HELIX_TCP_SERVER_HPP

#include <memory>
#include <string>

namespace helix {
namespace tcp {

// Default backlog size for listen() call
constexpr int DEFAULT_BACKLOG = 10;

/**
 * Configuration for creating a TCP server
 */
struct ServerConfig {
    std::string address;
    int port;
    
    ServerConfig(const std::string& addr, int p) 
        : address(addr), port(p) {}
};

/**
 * TCP Server class
 */
class TcpServer {
public:
    TcpServer(const ServerConfig& config);
    ~TcpServer();
    
    // Delete copy constructor and assignment operator
    TcpServer(const TcpServer&) = delete;
    TcpServer& operator=(const TcpServer&) = delete;
    
    /**
     * Start the server and begin listening for connections
     * @return true if server started successfully, false otherwise
     */
    bool start();
    
    /**
     * Stop the server and close all connections
     */
    void stop();
    
    /**
     * Check if the server is currently running
     * @return true if server is running, false otherwise
     */
    bool isRunning() const;
    
    /**
     * Get the server address
     * @return The IP address the server is configured to bind to
     */
    const std::string& getAddress() const { return config_.address; }
    
    /**
     * Get the server port
     * @return The port number the server is configured to listen on
     */
    int getPort() const { return config_.port; }

private:
    ServerConfig config_;
    int socket_fd_;
    bool is_running_;
};

/**
 * Factory function to create a TCP server
 * This will be the main exported function for the addon
 * 
 * @param address The IP address to bind to (e.g., "127.0.0.1", "0.0.0.0")
 * @param port The port number to listen on
 * @return Unique pointer to a new TcpServer instance
 */
std::unique_ptr<TcpServer> create_server(const std::string& address, int port);

}  // namespace tcp
}  // namespace helix

#endif  // HELIX_TCP_SERVER_HPP
