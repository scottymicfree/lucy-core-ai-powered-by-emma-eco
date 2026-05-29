#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

SEC("xdp_tarpit")
int parse_and_tarpit(struct xdp_md *ctx) {
    // Memory boundaries for safe kernel-space pointer arithmetic
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    // Filter for IPv4
    if (eth->h_proto!= bpf_htons(ETH_P_IP))
        return XDP_PASS;

    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return XDP_PASS;

    // Filter for TCP
    if (ip->protocol!= IPPROTO_TCP)
        return XDP_PASS;

    // Calculate dynamic IP header length to locate the TCP header
    struct tcphdr *tcp = (void *)ip + ip->ihl * 4;
    if ((void *)(tcp + 1) > data_end)
        return XDP_PASS;

    // Intelligence Gateway Protection
    // If probing the secure API port (e.g., 8443) or known SSH ports
    if (tcp->dest == bpf_htons(8443) || tcp->dest == bpf_htons(22)) {
        // Tarpit Action: Drop packet immediately at the NIC
        // The attacker receives no RST packet, forcing their socket to hang
        return XDP_DROP; 
    }

    // Allow legitimate telemetry traffic to proceed to the Python runtime
    return XDP_PASS;
}

char _license SEC("license") = "GPL";
