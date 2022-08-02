// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year" and release schedules are monthly.
 */
contract TokenMultiTimelock {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 public immutable token;

    // beneficiary of tokens after they are released
    address public immutable beneficiary;

    // timestamp when token release is enabled
    uint256[] public releaseTimes;

    // amount to release for each releaseTime
    uint256[] public releaseAmounts;

    // index of the next release
    uint256 public currentIndex;

    // name of the contract
    string public name;

    event Release(
        uint256 amount,
        address beneficiary,
        uint256 timestamp,
        uint256 releaseIndex
    );

    /**
     * @dev Deploys a timelock instance that is able to hold the token specified, and will only release it to
     * `_beneficiary` when {release} is invoked after `releaseTime_`. The release time is specified as a Unix timestamp
     * (in seconds).
     */
    constructor(
        address _token,
        address _beneficiary,
        uint256[] memory _releaseTimes,
        uint256[] memory _releaseAmounts,
        string memory _name
    ) {
        for (uint256 i = 0; i < _releaseTimes.length; i++) {
            require(
                _releaseTimes[i] > block.timestamp,
                "release is before current time"
            );
        }
        token = IERC20(_token);
        beneficiary = _beneficiary;
        releaseTimes = _releaseTimes;
        releaseAmounts = _releaseAmounts;
        name = _name;
        currentIndex = 0;
    }

    /**
     * @dev Transfers tokens held by the timelock to the beneficiary. Will only succeed if invoked after the release
     * time. Every release sets the index to the next release.
     */
    function release() external {
        require(currentIndex < releaseTimes.length, "no more schedules");
        require(
            block.timestamp >= releaseTimes[currentIndex],
            "current time is before release"
        );

        uint256 amount = releaseAmounts[currentIndex];

        token.safeTransfer(beneficiary, amount);
        emit Release(amount, beneficiary, block.timestamp, currentIndex);
        currentIndex += 1;
    }
}
