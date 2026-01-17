#include "tcp_server.hpp"
#include <gtest/gtest.h>
#include <memory>

namespace helix {
namespace tcp {
namespace test {

class TcpServerTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Setup code if needed
    }
    
    void TearDown() override {
        // Cleanup code if needed
    }
};

// Test create_server function
TEST_F(TcpServerTest, CreateServerReturnsValidPointer) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 8080));
    ASSERT_NE(server, nullptr);
}

// Test server configuration
TEST_F(TcpServerTest, ServerConfigurationIsCorrect) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 8080));
    EXPECT_EQ(server->getAddress(), "127.0.0.1");
    EXPECT_EQ(server->getPort(), 8080);
}

// Test initial server state
TEST_F(TcpServerTest, ServerInitiallyNotRunning) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 8080));
    EXPECT_FALSE(server->isRunning());
}

// Test server start
TEST_F(TcpServerTest, ServerCanStart) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 9001));
    EXPECT_TRUE(server->start());
    EXPECT_TRUE(server->isRunning());
    server->stop();
}

// Test server stop
TEST_F(TcpServerTest, ServerCanStop) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 9002));
    server->start();
    server->stop();
    EXPECT_FALSE(server->isRunning());
}

// Test multiple start attempts
TEST_F(TcpServerTest, CannotStartServerTwice) {
    std::unique_ptr<TcpServer> server(create_server("127.0.0.1", 9003));
    EXPECT_TRUE(server->start());
    EXPECT_FALSE(server->start());  // Second start should fail
    server->stop();
}

// Test invalid address
TEST_F(TcpServerTest, InvalidAddressFailsToStart) {
    std::unique_ptr<TcpServer> server(create_server("invalid.address", 8080));
    EXPECT_FALSE(server->start());
}

// Test server with different valid addresses
TEST_F(TcpServerTest, ServerStartsOnDifferentAddresses) {
    std::unique_ptr<TcpServer> server1(create_server("127.0.0.1", 9004));
    EXPECT_TRUE(server1->start());
    server1->stop();
    
    std::unique_ptr<TcpServer> server2(create_server("0.0.0.0", 9005));
    EXPECT_TRUE(server2->start());
    server2->stop();
}

// Test server with different ports
TEST_F(TcpServerTest, ServerStartsOnDifferentPorts) {
    std::unique_ptr<TcpServer> server1(create_server("127.0.0.1", 9006));
    std::unique_ptr<TcpServer> server2(create_server("127.0.0.1", 9007));
    
    EXPECT_TRUE(server1->start());
    EXPECT_TRUE(server2->start());
    
    server1->stop();
    server2->stop();
}

}  // namespace test
}  // namespace tcp
}  // namespace helix
