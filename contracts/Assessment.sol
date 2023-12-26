pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ApplyForEducationLoan(uint256 amount, uint256 durationInMonths);
    event RepayEducationLoan(uint256 amount);

    uint256 public educationLoanBalance;
    mapping(address => uint256) public educationLoanDebts;

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        educationLoanBalance = 0;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function applyForEducationLoan(uint256 _amount, uint256 _durationInMonths) public {
        require(_amount > 0, "Loan amount must be greater than 0");
        require(_durationInMonths > 0, "Loan duration must be greater than 0");
        uint256 monthlyInstallment = _amount / _durationInMonths;
        educationLoanBalance += _amount;
        educationLoanDebts[msg.sender] += monthlyInstallment * _durationInMonths;
        emit ApplyForEducationLoan(_amount, _durationInMonths);
    }

    function repayEducationLoan() public payable {
        require(educationLoanDebts[msg.sender] > 0, "No education loan to repay");
        uint256 remainingDebt = educationLoanDebts[msg.sender] - msg.value;
        require(remainingDebt >= 0, "Repayment amount exceeds the remaining debt");
        educationLoanBalance -= msg.value;
        educationLoanDebts[msg.sender] = remainingDebt;
        emit RepayEducationLoan(msg.value);
    }
}
