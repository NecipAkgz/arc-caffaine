// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArcCaffeine {
    // State Variables
    mapping(address => string) public usernames;
    mapping(string => address) public addresses;
    mapping(address => uint256) public balances;

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // Store memos per user
    mapping(address => Memo[]) private userMemos;

    // Events
    event UserRegistered(address indexed user, string username);
    event NewMemo(
        address indexed from,
        address indexed to,
        uint256 timestamp,
        string name,
        string message
    );
    event Withdrawal(address indexed user, uint256 amount);

    // Functions

    /**
     * @dev Register a unique username for the caller.
     * @param _username The desired username.
     */
    function registerUser(string memory _username) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(addresses[_username] == address(0), "Username already taken");
        require(
            bytes(usernames[msg.sender]).length == 0,
            "User already registered"
        );

        usernames[msg.sender] = _username;
        addresses[_username] = msg.sender;

        emit UserRegistered(msg.sender, _username);
    }

    /**
     * @dev Buy a coffee (donate) to a registered user.
     * @param _username The username of the recipient.
     * @param _name The name of the donor.
     * @param _message A message from the donor.
     */
    function buyCoffee(
        string memory _username,
        string memory _name,
        string memory _message
    ) public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        address recipient = addresses[_username];
        require(recipient != address(0), "User not found");

        // Update balance (Withdraw Pattern)
        balances[recipient] += msg.value;

        // Add memo to recipient's history
        userMemos[recipient].push(
            Memo(msg.sender, block.timestamp, _name, _message)
        );

        emit NewMemo(msg.sender, recipient, block.timestamp, _name, _message);
    }

    /**
     * @dev Withdraw accumulated earnings.
     */
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Get memos for a specific user.
     */
    function getMemos(address _user) public view returns (Memo[] memory) {
        return userMemos[_user];
    }
}
