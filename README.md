# Pixel8Labs Front-end Engineer Take-home Test

Thanks for your interest in working with us as a web3 front-end engineer.
This take-home test is for us to gauge your engineering capabilities and determine
whether we can move to the work trial phase. It's not a test per se but rather a
way for Pixel8Labs to know more about your abilities and also for you to see if
you would like the kind of work we do, before we spend more time together in the
work trial.

This test should not take you more than 5 hours but you are allowed to spend more
than 5 hours within the given 2 days just in case you want to touch things up and
submit a polished piece of work.

## Tasks

Here are the requirements for the take-home project

## Netlify Site
[netlify site](https://fachry-labs.netlify.app)

### Basic tasks

- [x] Implement [this website](https://pepedoods.com) in React (with correct metadata and favicon). We hope that you would know how to extract static assets like images, fonts from an existing website.
- [x] Replace "Minting Soon" text with a minting widget that consists of:
  - a dropdown number pick for the number NFTs to mint
  - a mint button
  - a sub-text showing how many NFTs have been minted
- [x] Web3 integration with [this contract on Rinkeby](https://rinkeby.etherscan.io/address/0xbe4F068501dE3ae5Fd860eC153984ADfb494074D) for NFT minting and showing current mint number
- [x] Make use of the modal component to show users feedback about their mint transaction status, and show the minted NFTs to them after transaction has been confirmed

### Stretch (optional) tasks

These tasks are optional but we would encourage you to give them a try to demonstrate more of your skills

- [ ] Implement a mint button disable/enable depending on whether the wallet is whitelisted or not
- [x] Setup Github Actions for lint check
- [ ] Setup Github Actions for Netlify staging deployment on PRs to `master`
- [ ] Setup Github Actions to deploy to Github Pages on pushes to `master`

## Tips

- Checkout these React libraries that we use in the boilerplate:
  - [Reactstrap](https://reactstrap.github.io/)
  - [styled-components](https://styled-components.com/)
- Ask @owenyuwono or @stanleynguyen to whitelist your wallet address or give you a whitelisted wallet for development purpose
- Get some rinkeby ETH from [this faucet](https://faucets.chain.link/rinkeby)
- The abi and static files that you need for web3 integrations are in [the contracts folder](./src/contracts/)
- Last but not least, remember to **have fun**!!
