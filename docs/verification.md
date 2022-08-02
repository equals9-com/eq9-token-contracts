# How to verifiy contracts on Harmony

It's quite complicated right now to verify contracts on harmony, but I found a way that works:

1- Flatten the contract with `npx hardhat flatten`.
2- Remove Solidity comments with: https://solidity-comment-cleaner.netlify.app/ 
3- Remove all `pragma solidity <version>` from the contract except the one on top.
4- Use the exact same compiler version used to build the contract.

# How to verify contracts on polygon


```
npx hardhat verify CONTRACT_ADDR --network mumbai
```