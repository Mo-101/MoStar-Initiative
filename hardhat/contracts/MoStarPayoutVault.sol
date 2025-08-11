
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MoStarPayoutVault is Ownable {
    event Payout(address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function payout(address payable to, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient funds in vault");
        to.transfer(amount);
        emit Payout(to, amount);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
