// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title EQ9 Token(EQ9)
 * @author Pedro Henrique Bufulin de Almeida
 * @notice Implements a basic ERC20 utility & staking token.
 */
contract MockUSDT is ERC20 {

    constructor() ERC20("USDT", "USDT") {
        _mint(msg.sender, 18 * 10 ** 8 * (10 ** decimals()));
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
