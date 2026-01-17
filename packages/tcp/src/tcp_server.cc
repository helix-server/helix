#include "tcp_server.hpp"

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>
#include <cstring>
#include <iostream>

namespace helix {
namespace tcp {

TcpServer::TcpServer(const ServerConfig& config)
    : config_(config), socket_fd_(-1), is_running_(false) {}

TcpServer::~TcpServer() {
    stop();
}

bool TcpServer::start() {
    if (is_running_) {
        std::cerr << "Server is already running" << std::endl;
        return false;
    }
    
    // Create socket
    socket_fd_ = socket(AF_INET, SOCK_STREAM, 0);
    if (socket_fd_ < 0) {
        std::cerr << "Failed to create socket" << std::endl;
        return false;
    }
    
    // Set socket options to allow address reuse
    int opt = 1;
    if (setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        std::cerr << "Failed to set socket options" << std::endl;
        close(socket_fd_);
        socket_fd_ = -1;
        return false;
    }
    
    // Prepare the sockaddr_in structure
    struct sockaddr_in server_addr;
    std::memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(config_.port);
    
    // Convert IPv4 address from text to binary form
    if (inet_pton(AF_INET, config_.address.c_str(), &server_addr.sin_addr) <= 0) {
        std::cerr << "Invalid address: " << config_.address << std::endl;
        close(socket_fd_);
        socket_fd_ = -1;
        return false;
    }
    
    // Bind the socket to the address
    if (bind(socket_fd_, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        std::cerr << "Failed to bind socket to " << config_.address << ":" << config_.port << std::endl;
        close(socket_fd_);
        socket_fd_ = -1;
        return false;
    }
    
    // Listen for incoming connections
    if (listen(socket_fd_, DEFAULT_BACKLOG) < 0) {
        std::cerr << "Failed to listen on socket" << std::endl;
        close(socket_fd_);
        socket_fd_ = -1;
        return false;
    }
    
    is_running_ = true;
    std::cout << "TCP Server listening on " << config_.address << ":" << config_.port << std::endl;
    
    return true;
}

void TcpServer::stop() {
    if (socket_fd_ >= 0) {
        close(socket_fd_);
        socket_fd_ = -1;
    }
    is_running_ = false;
}

bool TcpServer::isRunning() const {
    return is_running_;
}

std::unique_ptr<TcpServer> create_server(const std::string& address, int port) {
    ServerConfig config(address, port);
    return std::make_unique<TcpServer>(config);
}

}  // namespace tcp
}  // namespace helix
