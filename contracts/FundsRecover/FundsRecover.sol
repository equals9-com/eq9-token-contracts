 pragma solidity >=0.7.0 <0.9.0;  
contract MoveETH {
    constructor(address sendToAddress) payable 
    {
        address payable addr = payable(address(sendToAddress)); selfdestruct(addr); 
    }
}