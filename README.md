# Equals 9 Utility token smart contracts

This repository contains the source code and a small test file to test the custom functionality of
the eq9 token.


# deployed contracts addresses


## Contracts on Polygon mainnet

EQ9 address on polygon mainnet: `0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6`

https://polygonscan.com/token/0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6#balances

It is possible the check the timelock contracts in the token holders chart:
https://polygonscan.com/token/tokenholderchart/0x3963a400b42377376d6c3d92ddf2d6288d8ee0d6


### Staking contract

The Staking contract address is `0xC5A3B0B59d4Ed2AB73B5f3fEf956525F9d5ee2e7` and it's also verified on polygonscan:

https://polygonscan.com/address/0xC5A3B0B59d4Ed2AB73B5f3fEf956525F9d5ee2e7#code


### Tournament manager contract

The tournament manager contract address is `0x59a3aB823c63268CBfDD13476031a47E07f179e7` and it's also verified on 
polygonscan:

https://polygonscan.com/address/0x59a3aB823c63268CBfDD13476031a47E07f179e7


## All contracts on mumbai testnet from here

EQ9 token on mumbai testnet: `0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B`


https://mumbai.polygonscan.com/token/tokenholderchart/0x7B4736f9C88c0A59310BfFD3F5d7462812aeC43B

### Staking contract

The Staking contract address is `0x437070cAf868604bE93613627f99a655586EE7C9` and it's also verified on mumbai scan:

https://mumbai.polygonscan.com/address/0x437070cAf868604bE93613627f99a655586EE7C9#code    


### TournamentManager contract

The tournament manager contract address is `0xa938AF9d64b6DeE5d79BCAC8ad1cB12DD2D6c360`
 and it's also verified on 
mumbai scan:

https://mumbai.polygonscan.com/address/0xa938AF9d64b6DeE5d79BCAC8ad1cB12DD2D6c360




## testing

The test file included only tests the custom stake functionality. All other functionalities are standard OpenZeppelin ERC20. 

Tests can be run with `npx hardhat test  --parallel`.


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

Last distribution : 01 - 12 - 2024:

timelock address: https://polygonscan.com/address/0x90e49f5ffce602ec7aefd7471cc307fd2c901061


Harvesting: 

Total locked: 293.166.000 EQ9
Monthly release: 10.858.000 EQ9
(27 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 03 - 2025:IDO/IEOs: 

timelock address: https://polygonscan.com/address/0xaa6376064c8351c961077b9d4d1aa6365e71c99f



IEO/IDO

Total Locked: 136.680.000 EQ9
Monthly release: 11.400.000 EQ9
(12 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 12 - 2023:

timelock address: https://polygonscan.com/address/0x28c1a012a5c6de345f6eac4bc41f31473aac1a26  

Marketing&Partnership: 

Total Locked: 261.377.820 EQ9
Monthly release:  7.920.540 EQ9
(33 times)
First distribution: 01 - 01 - 2023

Last distribution : 01 - 09 - 202:

timelock address: https://polygonscan.com/address/0x6860e99e12106973d55308ac967f9b1554750ebc

Social Projects: 

Total Locked: 450.000.000 EQ9
Monthly release: 12.500.000 EQ9
(36 times)
First distribution: 01 - 01 - 2023
Last distribution : 01 - 12 - 2025

timelock address: https://polygonscan.com/address/0x249cdf757a499145af6a2b3a3d31ffe9de3c8cd5



More details here: https://equals9.com/documents/TOKENOMICS_ENGLISH.pdf




## Other timelocks:

https://polygonscan.com/address/0xb2fb6d9472cb90ae56506f3274c1304d57c35fb1
https://polygonscan.com/address/0x05BdC765c286C930FB02799D365523E25BB7b2C5

## On Harmony mainnet before network change (LEGACY)

The contract is deployed in the following addres: `0x598228643d6faa1b5569c3d996cb8cf8ca1fdb92`
on the harmony mainnet network.

You can check it on the explorer: https://explorer.harmony.one/address/0x598228643d6faa1b5569c3d996cb8cf8ca1fdb92