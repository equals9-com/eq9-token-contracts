// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "hardhat/console.sol";

/**
 * @title Staking
 * @notice This contract allows to stake EQ9 into players of equalssport.
 * Staking rewards are calculated off-chain, but baased on this contract.
 */

interface IStaking {
    event Staked(
        uint256 amount,
        uint256 timestamp,
        address player,
        address staker
    );
    event Unstaked(
        uint256 amount,
        uint256 timestamp,
        address player,
        address staker
    );
    event Claimed(uint256 amount, uint256 timestamp, address staker);

    /**
     * @dev function to stake an amount into some player address
     * @notice When staking, the value is incremented in the stakerAmounts, and the
     * timestamp is set if it's the first time of staking.
     * @param _amount value of EQ9 to stake
     * @param _player address of the player to stake
     */
    function stake(uint256 _amount, address _player) external;

    /**
     * @dev function to unstake an amount from some player address
     * If unstake is total, timestamp is reseted and staker address
     * is removed from staker addresses EnumerableSet
     * @notice by unstaking, staking rewards by timestamp will be lower,
     * becauuse the time amount in stake will be decreased
     * @param _amount value of EQ9 to unstake
     * @param _player address of the player to stake
     */
    function unstake(uint256 _amount, address _player) external;

    /**
     * @dev function used to the user claim the unstake
     * performed at unstake function, here is where the user
     * in fact will get the unstaked tokens with a limit of
     * once in 24 hours unless he peform another unstake elsewhere
     * @notice the user will always claim the total value of claimAmount
     */
    function claim() external;

    function fetchStakersAmount(
        address _player
    ) external view returns (uint256 _stakersAmount);

    /**
     * @dev function used to fetch all stakes into a player
     * @param _player address of the player receiving stakes
     * @param _start index to start the array.
     * @param _limit index to end search
     */

    function fetchPlayerStakes(
        address _player,
        uint256 _start,
        uint256 _limit
    )
        external
        view
        returns (
            address[] memory stakers_,
            uint256[] memory amounts_,
            uint256[] memory timestamps_
        );

    /**
     * @dev this function will be used by the onwer to revert all stakes of a
     * given user.
     */
    function revertStakesFromAPlayer(address _staker, address _player) external;
}
