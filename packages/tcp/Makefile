# Makefile for Helix TCP Module
# Alternative build system to Bazel

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -I./include
LDFLAGS =

# Directories
SRC_DIR = src
INCLUDE_DIR = include
TEST_DIR = test
BUILD_DIR = build

# Files
SOURCES = $(SRC_DIR)/tcp_server.cc
HEADERS = $(INCLUDE_DIR)/tcp_server.hpp
TEST_SOURCES = $(TEST_DIR)/manual_test.cc
OBJECTS = $(BUILD_DIR)/tcp_server.o

# Targets
.PHONY: all clean test

all: $(BUILD_DIR)/libtcp_server.a

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/tcp_server.o: $(SOURCES) $(HEADERS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -c $(SOURCES) -o $@

$(BUILD_DIR)/libtcp_server.a: $(OBJECTS)
	ar rcs $@ $^

test: $(BUILD_DIR)/tcp_test
	$(BUILD_DIR)/tcp_test

$(BUILD_DIR)/tcp_test: $(SOURCES) $(TEST_SOURCES) $(HEADERS) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) $(SOURCES) $(TEST_SOURCES) -o $@ $(LDFLAGS)

clean:
	rm -rf $(BUILD_DIR)

help:
	@echo "Available targets:"
	@echo "  all    - Build the TCP server library"
	@echo "  test   - Build and run manual tests"
	@echo "  clean  - Remove build artifacts"
	@echo "  help   - Show this help message"
