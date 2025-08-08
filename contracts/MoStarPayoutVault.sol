// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * MoStarPayoutVault
 * - Holds MATIC (or any native token) and lets the owner pay out to wallets.
 */
contract MoStarPayoutVault {
    address public owner;

    event Payout(address indexed to, uint256 amountWei);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    constructor() payable {
        owner = msg.sender;
    }

    /* ───────────────── modifiers ───────────────── */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /* ───────────────── receive ──────────────────── */
    receive() external payable {}

    /* ───────────────── actions  ─────────────────── */
    function payout(address payable to, uint256 amountWei) external onlyOwner {
        require(address(this).balance >= amountWei, "Insufficient balance");
        to.transfer(amountWei);
        emit Payout(to, amountWei);
    }

    function sweepAll() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero addr");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /* view */
    function vaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
