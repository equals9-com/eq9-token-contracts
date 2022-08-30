# Equals 9 Utility token smart contracts

This repository contains the source code and a small test file to test the custom functionality of
the eq9 token.


## deployed contracts addresses

The contract is deployed in the following addres: `0x598228643d6faa1b5569c3d996cb8cf8ca1fdb92`
on the harmony mainnet network.

You can check it on the explorer: https://explorer.harmony.one/address/0x598228643d6faa1b5569c3d996cb8cf8ca1fdb92


## On Polygon mainnet after the network change

https://polygonscan.com/token/0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6#balances

It is possible the check the timelock contracts in the token holders chart:
https://polygonscan.com/token/tokenholderchart/0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6

## On polygon mumbai testnet

We have a testnet token without timelocks for testing on polygon:

https://mumbai.polygonscan.com/token/tokenholderchart/0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B

    We have the staking contract deployed on mumbai: 0x5929Ab2f13b674e38f55815434BaBe3ee92F709f


## testing

The test file included only tests the custom stake functionality. All other functionalities are standard OpenZeppelin ERC20. 

Tests can be run with `npx hardhat test`.


## Fixes from the audit

### CENT-1 

Doing the timelocks to fix this issue. Timelcoks are described in the end of this document.

### EXT-1

Since we might redeploy it, this stops being an issue.

### GAS-1

Fixed by shortening require messages in the ERC20 implementation.


### GAS-2 

Fixed by changing the following functions types to external:

- name (done)
- symbol -> (done)
- totalSupply -> (done)
- balanceOf -> (done)
- transfer -> (done)
- allowance -> (left as public for easier testing)
- approve -> (done)
- transferFrom -> (done)
- increaseAllowance -> (done)
- decreaseAllowance -> (done)
- stake -> (done)
- unstake -> (done)
- amountStakes -> (done)


### COMP-1

Locked the compiler version to `pragma solidity 0.8.0;`


### BP-1
Changed  `1800000000`  to be represented as  `18 * 10 ** 8`

### BP-2

It's not a typo. `amountStakes` is different from `amountStaked`. `amountStakes` is counting the amount of individual 
stakes that happened, while `amountStaked` is counting the total staked for the contract. The function does the first, it counts how much does it have of each individual stake.

### FUNC-1

Since those are part of the open zeppelin standard contract, I'm leaving them as it is.


## Locking for later reference

Please acknowledge that the dates are of the format `dd - mm - yyyy`
Vesting Contracts:


Seed Sales: 

Total locked: 274.823.820 EQ9
Monthly release: 10.178.660 EQ9
(27 times)
First distribution: 01 - 10 - 2023

Last distribution : 01 - 12 - 202:


Harvesting: 

Total locked: 293.166.000 EQ9
Monthly release: 10.858.000 EQ9
(27 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 03 - 2025:IDO/IEOs: 




Total Locked: 136.680.000 EQ9
Monthly release: 11.400.000 EQ9
(12 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 12 - 2023:


Marketing&Partnership: 

Total Locked: 261.377.820 EQ9
Monthly release:  7.920.540 EQ9
(33 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 09 - 202:


Social Projects: 

Total Locked: 450.000.000 EQ9
Monthly release: 12.500.000 EQ9
(36 times)
First distribution: 01 - 01 - 2023
Last distribution : 01 - 12 - 2025



More details here: https://equals9.com/documents/TOKENOMICS_ENGLISH.pdf


