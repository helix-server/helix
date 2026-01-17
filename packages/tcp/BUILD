load("@rules_cc//cc:defs.bzl", "cc_library", "cc_test")

# TCP Server Library
cc_library(
    name = "tcp_server",
    srcs = ["src/tcp_server.cc"],
    hdrs = ["include/tcp_server.hpp"],
    includes = ["include"],
    visibility = ["//visibility:public"],
)

# TCP Server Tests
cc_test(
    name = "tcp_server_test",
    size = "small",
    srcs = ["test/tcp_server_test.cc"],
    deps = [
        ":tcp_server",
        "@com_google_googletest//:gtest",
        "@com_google_googletest//:gtest_main",
    ],
)
