<h1 align="center">
  <a href="https://mimic.fi">
    <img src="https://www.mimic.fi/logo.png" alt="Mimic Protocol" width="200">
  </a>
</h1>

<h4 align="center">Developer platform for blockchain apps</h4>

<p align="center">
  <a href="https://discord.mimic.fi">
    <img src="https://img.shields.io/badge/discord-join-blue" alt="Discord">
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#scope-and-chain-support">Scope</a> •
  <a href="#setup">Setup</a> •
  <a href="#license">License</a>
</p>

---

## Overview

This repository demonstrates how to build a subscription payment system on Ethereum using Mimic as the execution and automation layer.

In this example, users can schedule periodic subscription payments using:
- Any supported token
- On a defined payment interval
- Without holding native tokens for gas

The application does not implement:
- Scheduled transaction execution
- Token swaps for subscription payments
- Cross-chain transfers
- Gas management
- RPC connections or oracle integrations

Mimic handles automation and execution by:
- Executing payments at scheduled intervals
- Routing execution across chains when required
- Managing gas payment and retries
- Ensuring reliable execution without user intervention

This allows the application to define subscription logic without maintaining custom automation or execution infrastructure.

## Scope

This example uses Ethereum as the reference chain.

Mimic supports execution across multiple chains, including cross-chain payment flows. The same subscription model applies to other supported networks.

## Setup

To set up this project you'll need [git](https://git-scm.com) and [yarn](https://classic.yarnpkg.com) installed.

From your command line:

```bash
# Clone the repository
git clone https://github.com/mimic-fi/cross-chain-subscription-payments-with-mimic

# Enter the repository
cd cross-chain-subscription-payments-with-mimic

# Install dependencies
yarn
```

## License

MIT

---

> Website [mimic.fi](https://mimic.fi) &nbsp;&middot;&nbsp;
> Docs [docs.mimic.fi](https://docs.mimic.fi) &nbsp;&middot;&nbsp;
> GitHub [@mimic-fi](https://github.com/mimic-fi) &nbsp;&middot;&nbsp;
> Twitter [@mimicfi](https://twitter.com/mimicfi) &nbsp;&middot;&nbsp;
> Discord [mimic](https://discord.mimic.fi)
