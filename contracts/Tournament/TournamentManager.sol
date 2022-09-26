// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TournamentManager
 * @notice This Contract allows an EVO from the Equals9 platform to create a
 * tournament and receive tickets from subscription in the form of the ONE token, or other native currency token.
 * The sum of all tickets is the total prize. The prize will be distributed later with a PaymentSplitter.
 * There is also a native token fee that if present can be used to stake and generate energy that can be
 * distributed among subscription for free transactions.
 */

contract TournamentManager is Ownable, ReentrancyGuard, Pausable {
    string public name;

    struct Sponsor {
        address walletAddress;
        uint256 amount;
    }

    struct Player {
        address walletAddress;
    }

    struct Tournament {
        address admin;
        IERC20 token;
        uint256 totalShares;
        uint256 totalAccTokenReward;
        uint256 sponsorTotalAcc;
        uint256 tokenFee;
        TournamentState state;
    }

    /**
     * @dev for simplicity some variables will be storaged outside the tournament struct
     */

    mapping(uint256 => mapping(address => uint256)) public subscription;

    mapping(uint256 => Sponsor[]) public sponsors;

    mapping(uint256 => Player[]) public players;

    mapping(uint256 => Tournament) public tournaments;

    // to make it easier to redeem, shares will be not related to specific tournaments instatiated
    mapping(address => uint256) public shares;

    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;

    Counters.Counter private id;

    /**
     * @notice will be used to represent the current state
     * of the tournament. Players can only unsbubscribe
     * if tournament is in Waiting state. Not any other.
     */
    enum TournamentState {
        Waiting,
        Started,
        Ended
    }

    event TournamentCreated(uint256 indexed id);
    event SubscriptionCancelled(
        uint256 indexed id,
        address player,
        uint256 subscription,
        address token
    );
    event TournamentCanceled(uint256 indexed id);
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);
    event prizeIncreased(
        uint256 indexed id,
        address sender,
        uint256 prize,
        address tokenAddress
    );
    event PlayerJoined(
        uint256 indexed id,
        address player,
        uint256 subscription,
        address token
    );
    event PlayerExited(uint256 indexed id, address player);

    /**
     * @dev Creates an instance of the TournamentManager
     */

    constructor() {
        name = "Tournament Manager Contract";
    }

    /**
     * @dev creates a tournament and associates it to an id. The sender is the administrator of this
     * tournament id. Allows the creator to associate a diferent token from the network token, it
     * requires to be rc20.
     * @param _fee the subscription price for this tournamentInstance.
     * @param _token the address of the given token contract.
     */

    function createTournament(uint256 _fee, address _token)
        public
        payable
        whenNotPaused
        returns (uint256)
    {
        uint256 currentId = id.current();
        Tournament storage newTournament = tournaments[currentId];
        newTournament.admin = msg.sender;
        newTournament.state = TournamentState.Waiting;
        newTournament.tokenFee = _fee;
        newTournament.token = _token == address(0)
            ? IERC20(address(0))
            : IERC20(_token);
        tournaments[currentId] = newTournament;
        id.increment();
        emit TournamentCreated(currentId);
        return currentId;
    }

    /**
     * @notice the tournamentAdmin is capable of cancelling a tournament.
     * @dev it sends back every subscription value to all players that joined this tournament.
     * @param _id the id of the tournament to cancel.
     */

    function cancelTournament(uint256 _id) public payable onlyAdmin(_id) {
        Tournament storage tournament = tournaments[_id];
        tournament.state = TournamentState.Ended;
        for (uint256 i = 0; i < players[_id].length; i++) {
            if (subscription[_id][players[_id][i].walletAddress] == 0) continue;
            _cancelSubscription(_id, payable(players[_id][i].walletAddress));
        }
        for (uint256 i = 0; i < sponsors[_id].length; i++) {
            _returnSponsorsTokens(
                _id,
                payable(sponsors[_id][i].walletAddress),
                sponsors[_id][i].amount
            );
        }
        emit TournamentCanceled(_id);
    }

    /**
     * @dev this funciton increases readability. It's only used in the cancelTournament() method,
     * and it sends back the refund for the player that joined a cancelled tournament
     * @param _id the id of the tournament to cancel.
     * @param _subscriber the player that subscribe and will receive back it's funds
     */

    function _cancelSubscription(uint256 _id, address payable _subscriber)
        private
        nonReentrant
    {
        Tournament storage tournament = tournaments[_id];
        uint256 refund = subscription[_id][_subscriber];
        subscription[_id][_subscriber] = 0;
        tournament.totalAccTokenReward -= refund;

        if (tournament.token == IERC20(address(0))) {
            Address.sendValue(_subscriber, refund);
            emit SubscriptionCancelled(_id, _subscriber, refund, address(0));
        } else {
            tournament.token.safeTransfer(_subscriber, refund);
            emit SubscriptionCancelled(
                _id,
                _subscriber,
                refund,
                address(tournament.token)
            );
        }
    }

    /**
     * @dev this funciton increases readability. It's only used in the cancelTournament() method,
     * and it sends back the refund for the player that joined a cancelled tournament
     * @param _id the id of the tournament to cancel.
     * @param _sponsor the sponsor that will receive back it's funds
     * @param _amount the amount of tokens used to sponsor the tournament
     */
    function _returnSponsorsTokens(
        uint256 _id,
        address payable _sponsor,
        uint256 _amount
    ) private nonReentrant {
        Tournament storage tournament = tournaments[_id];
        if (tournament.token == IERC20(address(0))) {
            Address.sendValue(_sponsor, _amount);
            tournament.totalAccTokenReward -= _amount;
            emit SubscriptionCancelled(_id, _sponsor, _amount, address(0));
        } else {
            tournament.token.safeTransfer(_sponsor, _amount);
            tournament.totalAccTokenReward -= _amount;
            tournament.sponsorTotalAcc -= _amount;
            emit SubscriptionCancelled(
                _id,
                _sponsor,
                _amount,
                address(tournament.token)
            );
        }
    }

    /**
     * @dev this modifier is used to check if the creator of the tournament is the one calling the method.
     * only the creator is allowed to associate shares and change the tournament state.
     * @param _id the id of the tournament to join
     */
    modifier onlyAdmin(uint256 _id) {
        require(
            tournaments[_id].admin == msg.sender,
            "only the admin of this tournament can handle this function"
        );
        _;
    }

    modifier onlyTokenERC20(uint256 _id) {
        require(
            tournaments[_id].token != IERC20(address(0)),
            "only avaible if theres a token ERC20 specified for this tournament"
        );
        _;
    }

    modifier onlyNetworkToken(uint256 _id) {
        require(
            tournaments[_id].token == IERC20(address(0)),
            "only avaible if theres no token ERC20 specified for this tournament"
        );
        _;
    }

    /**
     * @notice use this function to join the tournment.
     * It is necessary to pay the native token fee otherwise the player won't be
     * registered as participant of the tournament.
     * @param _id the id of the tournament to join
     */
    function join(uint256 _id)
        public
        payable
        nonReentrant
        onlyNetworkToken(_id)
    {
        Tournament storage tournament = tournaments[_id];
        require(
            tournament.state == TournamentState.Waiting,
            "tournament already started or ended"
        );
        require(
            msg.value == tournament.tokenFee,
            "amount inserted is not the required ticket price"
        );
        require(
            subscription[_id][msg.sender] == 0,
            "player has already joined"
        );

        subscription[_id][msg.sender] = msg.value;
        tournament.totalAccTokenReward += msg.value;
        players[_id].push(Player(msg.sender));
        emit PlayerJoined(_id, msg.sender, msg.value, address(0));
    }

    /**
     * @notice use this function to join the tournment.
     * It is necessary to pay the native token fee otherwise the player won't be
     * registered as participant of the tournament.
     * @param _id the id of the tournament to join
     */

    function joinERC20(uint256 _id) public nonReentrant onlyTokenERC20(_id) {
        Tournament storage tournament = tournaments[_id];
        require(
            tournament.state == TournamentState.Waiting,
            "tournament not waiting"
        );
        require(
            subscription[_id][msg.sender] == 0,
            "player has already joined"
        );

        uint256 _amount = tournament.tokenFee;
        subscription[_id][msg.sender] = _amount;
        tournament.totalAccTokenReward += _amount;
        tournament.token.safeTransferFrom(msg.sender, address(this), _amount);
        players[_id].push(Player(msg.sender));
        emit PlayerJoined(_id, msg.sender, _amount, address(tournament.token));
    }

    /**
     * @notice use this function to pay for the subscription of someone else
     * It is necessary to pay the native token fee otherwise the player won't be
     * registered as participant of the tournament.
     * @param _id the id of the tournament to join
     */
    function joinSomeoneElse(uint256 _id, address _player)
        public
        payable
        nonReentrant
        onlyNetworkToken(_id)
    {
        Tournament storage tournament = tournaments[_id];
        require(
            tournament.state == TournamentState.Waiting,
            "tournament already started or ended"
        );
        require(
            msg.value == tournament.tokenFee,
            "amount inserted is not the required ticket price"
        );
        require(subscription[_id][_player] == 0, "player has already joined");
        subscription[_id][_player] = msg.value;
        tournament.totalAccTokenReward += msg.value;
        players[_id].push(Player(_player));
        emit PlayerJoined(_id, _player, msg.value, address(0));
    }

    /**
     * @notice use this function to pay for the subscription of someone else
     * It is necessary to pay using the proper token fee otherwise the player won't be
     * registered as participant of the tournament.
     * @param _id the id of the tournament to join
     * @param _amount the ERC20 token amount used to transfer to the contract
     */
    function joinSomeoneElseERC20(
        uint256 _id,
        address _player,
        uint256 _amount
    ) public payable nonReentrant onlyTokenERC20(_id) {
        Tournament storage tournament = tournaments[_id];
        require(
            tournament.state == TournamentState.Waiting,
            "tournament already started or ended"
        );
        require(
            _amount == tournament.tokenFee,
            "amount inserted is not the required ticket price"
        );
        require(subscription[_id][_player] == 0, "player has already joined");
        subscription[_id][_player] = _amount;
        tournament.totalAccTokenReward += _amount;
        players[_id].push(Player(_player));
        tournament.token.safeTransferFrom(msg.sender, address(this), _amount);
        emit PlayerJoined(_id, _player, _amount, address(0));
    }

    /**
     * @notice use this function to add up the prize of the tournament using,
     * the network token
     * @param _id the id of the tournament to join
     */
    function addPrize(uint256 _id)
        public
        payable
        nonReentrant
        onlyNetworkToken(_id)
    {
        Tournament storage tournament = tournaments[_id];
        require(msg.value > 0, "prize increase must be greater than 0");
        require(
            tournament.state == TournamentState.Waiting,
            "tournament already started or ended"
        );

        tournament.totalAccTokenReward += msg.value;
        tournament.sponsorTotalAcc += msg.value;
        sponsors[_id].push(
            Sponsor({walletAddress: msg.sender, amount: msg.value})
        );
        emit prizeIncreased(_id, msg.sender, msg.value, address(0));
    }

    /**
     * @notice use this function to add up the prize of the tournament using,
     * a ERC20 token
     * @param _id the id of the tournament to join
     * @param _amount the ERC20 token amount used to transfer to the contract
     */
    function addPrizeERC20(uint256 _id, uint256 _amount)
        public
        payable
        nonReentrant
        onlyTokenERC20(_id)
    {
        Tournament storage tournament = tournaments[_id];
        require(_amount > 0, "prize increase must be greater than 0");
        require(
            tournament.state == TournamentState.Waiting,
            "tournament already started or ended"
        );

        tournament.token.safeTransferFrom(msg.sender, address(this), _amount);
        tournament.totalAccTokenReward += _amount;
        tournament.sponsorTotalAcc += _amount;
        sponsors[_id].push(
            Sponsor({walletAddress: msg.sender, amount: _amount})
        );
        emit prizeIncreased(
            _id,
            msg.sender,
            _amount,
            address(tournament.token)
        );
    }

    /**
     * @notice only the creator of this tournament is allowed to set the state
     * @param _id the id of the tournament to check state
     * @param _state the state to be specified
     */
    function setState(uint256 _id, TournamentState _state)
        public
        onlyAdmin(_id)
    {
        tournaments[_id].state = _state;
    }

    /**
     * @notice Auxuliary function to avoid misusage of setState function
     * @param _id the id of the tournament
     */
    function setWaitingState(uint256 _id) public onlyAdmin(_id) {
        tournaments[_id].state = TournamentState.Waiting;
    }

    /**
     * @notice Auxuliary function to avoid misusage of setState function
     * @param _id the id of the tournament
     */
    function setEndedState(uint256 _id) public onlyAdmin(_id) {
        tournaments[_id].state = TournamentState.Ended;
    }

    /**
     * @notice Auxuliary function to avoid misusage of setState function
     * @param _id the id of the tournament
     */
    function setStartedState(uint256 _id) public onlyAdmin(_id) {
        tournaments[_id].state = TournamentState.Started;
    }

    /**
     * @notice a player can exit a tournament and receive it's payment back
     * if the tournament has not started yet
     * @param _id the id of the tournament to exit
     */
    function exit(uint256 _id) public {
        Tournament storage tournament = tournaments[_id];
        require(
            subscription[_id][msg.sender] == tournament.tokenFee,
            "player must have paid the entire fee"
        );
        require(
            tournament.state == TournamentState.Waiting,
            "cannot exit if state is not waiting"
        );
        _cancelSubscription(_id, payable(msg.sender));
        emit PlayerExited(_id, msg.sender);
    }

    /**
     * @dev axuilirary function to check if player has paid the ticket, hence
     * joined the tournament
     * @param _id the id of the tournament to check payment
     * @param _player address to be checked
     */
    function checkPayment(uint256 _id, address _player)
        public
        view
        returns (bool)
    {
        if (subscription[_id][_player] == 0) {
            return false;
        } else return true;
    }

    /**
     * @dev Sets the Payment Splitter variables` where each account in `payees` is assigned the number of shares at
     * the matching position in the `shares` array.
     *
     * All addresses in `payees` must be non-zero. Both arrays must have the same non-zero length, and there must be no
     * duplicates in `payees`.
     * @param _id the id of the tournament this splitting is coming from
     * @param  _payees the receivers
     * @param _shares the amount of shares each payee receive. The indexes of these arrays MUST match
     * in order to guarantee they are receiving the adequate value
     */
    function splitPayment(
        uint256 _id,
        address[] memory _payees,
        uint256[] memory _shares
    ) public onlyAdmin(_id) {
        Tournament storage tournament = tournaments[_id];
        require(
            _payees.length == _shares.length,
            "payees and shares length mismatch"
        );
        require(_payees.length > 0, "no payees");
        uint256 totalAccTokenRewardBeforeSplitting = tournament.totalAccTokenReward;

        for (uint256 i = 0; i < _payees.length; i++) {
            _addPayee(_id, _payees[i], _shares[i]);
        }

        require(
            tournament.totalShares <= totalAccTokenRewardBeforeSplitting,
            "mismatch between accumulated and distributed"
        );
        tournament.totalShares = 0;
    }

    /**
     * @dev Add a new payee to the contract.
     * @param _id The _id of the
     * @param _account The address of the payee to add.
     * @param _shares The number of shares owned by the payee.
     */
    function _addPayee(
        uint256 _id,
        address _account,
        uint256 _shares
    ) private {
        Tournament storage tournament = tournaments[_id];
        require(
            _account != address(0),
            "PaymentSplitter: account is the zero address"
        );
        require(_shares > 0, "PaymentSplitter: shares are 0");
        require(players[_id].length > 0, "No players joined the tournament");
        require(tournament.totalAccTokenReward >= _shares, "Shares greater than accumulated token reward");
        
        shares[_account] += _shares;
        tournament.totalShares += _shares;
        tournament.totalAccTokenReward -= _shares;
        emit PayeeAdded(_account, _shares);
    }

    /**
     * @dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their
     * balance of shares
     * @param _account the receiver address of the shares
     * @param _amount the amount to be received
     */
    function release(
        uint256 _id,
        address payable _account,
        uint256 _amount
    ) public payable nonReentrant {
        require(shares[_account] > 0, "account has no shares");
        require(_amount <= shares[_account], "amount exceeds shares");
        Tournament storage tournament = tournaments[_id];

        shares[_account] -= _amount;

        if (tournament.token == IERC20(address(0))) {
            Address.sendValue(_account, _amount);
        } else {
            tournament.token.safeTransfer(_account, _amount);
        }

        emit PaymentReleased(_account, _amount);
    }

    /**
     * @dev helper function to return the array length of players of a particular tournament
     */
    function getPlayersLength(uint256 _id) external view returns (uint256) {
        return players[_id].length;
    }

    /**
     * @dev retunrs the current version of this contract

     */
    function version() public pure returns (string memory) {
        return "1.5.0";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
