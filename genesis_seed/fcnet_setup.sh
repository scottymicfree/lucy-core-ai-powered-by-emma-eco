#!/bin/bash
# Aegis-Pandora Host Network Initialization for Firecracker Sandbox
set -eux

TAP_DEV="tap0"
TAP_IP="172.16.0.1"
MASK_SHORT="/30"

# Teardown existing interfaces and create a fresh TAP device
sudo ip link del "$TAP_DEV" 2> /dev/null || true
sudo ip tuntap add dev "$TAP_DEV" mode tap
sudo ip addr add "${TAP_IP}${MASK_SHORT}" dev "$TAP_DEV"
sudo ip link set dev "$TAP_DEV" up

# Enable IPv4 forwarding in the host kernel
sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

# Configure iptables to route microVM traffic securely through the host
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -I FORWARD 1 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -I FORWARD 1 -i tap0 -o eth0 -j ACCEPT
