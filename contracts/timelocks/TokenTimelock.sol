// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/utils/TokenTimelock.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract TokenMultiTimelock {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 private immutable token;

    // beneficiary of tokens after they are released
    address private immutable beneficiary;

    // timestamp when token release is enabled
    uint256[] private releaseTimes;
    uint256 public currentIndex;

    /**
     * @dev Deploys a timelock instance that is able to hold the token specified, and will only release it to
     * `_beneficiary` when {release} is invoked after `releaseTime_`. The release time is specified as a Unix timestamp
     * (in seconds).
     */
    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256[] memory _releaseTimes
    ) {
        for (uint256 i = 0; i < _releaseTimes.length; i++) {
            require(
                _releaseTimes[i] > block.timestamp,
                "release is before current time"
            );
        }
        token = _token;
        beneficiary = _beneficiary;
        releaseTimes = _releaseTimes;
        currentIndex = 0;
    }

    /**
     * @dev Transfers tokens held by the timelock to the beneficiary. Will only succeed if invoked after the release
     * time. Every release sets the index to the next release.
     */
    function release() external {
        require(
            block.timestamp >= releaseTimes[currentIndex],
            "current time is before release"
        );

        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, "no tokens to release");

        token.safeTransfer(beneficiary, amount);
        currentIndex += 1;
    }
}
