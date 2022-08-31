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

contract Staking is Ownable, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for IERC20;

    string public name;
    IERC20 eq9Contract;
    error NoStakeAndClaimFound();

    // A player address will have many stakers
    mapping(address => EnumerableSet.AddressSet) private stakerAddresses;

    // these mappings are always of the form [playerAddress][stakerAddres]
    mapping(address => mapping(address => uint256)) public stakerTimestamps;
    mapping(address => mapping(address => uint256)) public stakerAmounts;

    //
    mapping(address => uint256) public claimAmount;
    mapping(address => uint256) public lastTimeUserUnstake;

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
    function stake(uint256 _amount, address _player) external whenNotPaused {
        if (!stakerAddresses[_player].contains(msg.sender)) {
            stakerAddresses[_player].add(msg.sender);
            stakerTimestamps[_player][msg.sender] = block.timestamp;
        }

        stakerAmounts[_player][msg.sender] += _amount;
        eq9Contract.safeTransferFrom(msg.sender, address(this), _amount);
        emit Staked(_amount, block.timestamp, _player, msg.sender);
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
    function unstake(uint256 _amount, address _player) external nonReentrant {
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
        emit Unstaked(_amount, block.timestamp, _player, msg.sender);
    }

    /**
     * @dev function used to the user claim the unstake
     * performed at unstake function, here is where the user
     * in fact will get the unstaked tokens with a limit of
     * once in 24 hours unless he peform another unstake elsewhere
     * @notice the user will always claim the total value of claimAmount
     */
    function claim() external nonReentrant {
        require(
            block.timestamp >= lastTimeUserUnstake[msg.sender] + 24 hours,
            "Unable to claim, 24 hours still have not have passed"
        );
        uint256 toSendAmount = claimAmount[msg.sender];
        claimAmount[msg.sender] = 0;
        eq9Contract.transfer(msg.sender, toSendAmount);
        emit Claimed(toSendAmount, block.timestamp, msg.sender);
    }

    function fetchStakersAmount(address _player)
        external
        view
        returns (uint256 _stakersAmount)
    {
        _stakersAmount = stakerAddresses[_player].length();
    }

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
        )
    {
        stakers_ = new address[](_limit);
        amounts_ = new uint256[](_limit);
        timestamps_ = new uint256[](_limit);

        for (uint256 i = _start; i < _limit; i++) {
            address staker = stakerAddresses[_player].at(i);
            stakers_[i] = staker;
            amounts_[i] = stakerAmounts[_player][staker];
            timestamps_[i] = stakerTimestamps[_player][staker];
        }

        return (stakers_, amounts_, timestamps_);
    }

    /**
     * @dev this function will be used by the onwer to revert all stakes of a
     * given user.
     */
    function revertStakesFromAPlayer(address _staker, address _player)
        external
        onlyOwner
    {
        uint256 total;

        if (claimAmount[_staker] == 0 && stakerAmounts[_player][_staker] == 0) {
            revert NoStakeAndClaimFound();
        }

        total = claimAmount[_staker] + stakerAmounts[_staker][_player];

        eq9Contract.transfer(_staker, total);
        stakerAddresses[_player].remove(_staker);
        stakerAmounts[_player][_staker] = 0;
        stakerTimestamps[_player][_staker] = 0;
        claimAmount[_staker] = 0;
        lastTimeUserUnstake[_staker] = 0;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
