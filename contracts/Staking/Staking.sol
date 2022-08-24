// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Staking
 * @notice This contract allows to stake EQ9 into players of equalssport.
 * Staking rewards are calculated off-chain, but baased on this contract.
 *yarn
 */

contract Staking is Ownable, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for IERC20;

    string public name;
    IERC20 eq9Contract;

    // Declare a set state variable

    mapping(address => EnumerableSet.AddressSet) private stakerAddresses;
    mapping(address => mapping(address => uint256)) public stakerTimestamps;
    mapping(address => mapping(address => uint256)) public stakerAmounts;
    mapping(address => uint256) public claimAmount;
    mapping(address => uint256) public lastTimeUserUnstake;

    event Staked(uint256 amount, address player, address staker);
    event Unstaked(uint256 amount, address player, address staker);

    constructor(address _eq9Contract) {
        name = "Staking Contract";
        eq9Contract = IERC20(_eq9Contract);
    }

    /**
     * @dev function to stake an amount into some player address
     * @notice When staking, the value is incremented in the stakerAmounts, and the
     * timestamp is set if it's the first time of staking.
     * @param _amount value of EQ9 to stake
     * @param _player address of the player to stake
     */
    function stake(uint256 _amount, address _player) public {
        if (!stakerAddresses[_player].contains(msg.sender)) {
            stakerAddresses[_player].add(msg.sender);
            stakerTimestamps[_player][msg.sender] = block.timestamp;
        }
        stakerAmounts[_player][msg.sender] += _amount;

        eq9Contract.safeTransferFrom(msg.sender, address(this), _amount);
        emit Staked(_amount, _player, msg.sender);
    }

    /**
     * @dev function to unstake an amount from some player address
     * If unstake is total, timestamp is reseted and staker address
     * is removed from staker addresses EnumerableSet
     * @notice by unstaking, staking rewards by timestamp will be lower,
     * becauuse the time amount in stake will be decreased
     * @param _amount value of EQ9 to unstake
     * @param _player address of the player to stake
     */
    function unstake(uint256 _amount, address _player) public {
        require(
            stakerAddresses[_player].contains(msg.sender),
            "You are not staking into this player address"
        );
        require(
            _amount <= stakerAmounts[_player][msg.sender],
            "Not enough staked amount into the player"
        );

        if (stakerAmounts[_player][msg.sender] == _amount) {
            stakerAddresses[_player].remove(msg.sender);
            stakerTimestamps[_player][msg.sender] = 0;
        }

        lastTimeUserUnstake[msg.sender] = block.timestamp;
        stakerAmounts[_player][msg.sender] -= _amount;
        claimAmount[msg.sender] += _amount;
        emit Unstaked(_amount, _player, msg.sender);
    }

    /**
     * @dev function used to the user claim the unstake
     * performed at unstake function, here is where the user
     * in fact will get the unstaked tokens with a limit of
     * once in 24 hours unless he peform another unstake elsewhere
     * @notice the user will always claim the total value of claimAmount
     */
    function claim() external {
        require(
            block.timestamp >= lastTimeUserUnstake[msg.sender] + 24 hours,
            "Unable to claim, 24 hours still have not have passed"
        );

        eq9Contract.transfer(msg.sender, claimAmount[msg.sender]);
        claimAmount[msg.sender] = 0;
    }

    // function fetchStakersAmount(address _player)
    //     external
    //     view
    //     returns (
    //         uint256 _stakersAmount
    //     )
    // {
    //     _stakersAmount = stakerAddresses[_player].length();
    // }

    // function fetchPlayerStakers(address _player)
    //     external
    //     view
    //     returns (address[]  memory _stakerAddresses,
    //         uint256[]  memory _stakerAmounts,
    //         uint256[] memory stakerTimestamps
    //     )
    // {
    //     _stakerAddresses = stakerAddresses[_player].values();
    // }
}