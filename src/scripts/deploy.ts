import { prodConfigs } from "../deploy/config";
import { HyperswapDeployer } from "../deploy/deploy";
import {
  AbacusCore,
  MultiProvider,
  getChainToOwnerMap,
  objMap,
  serializeContracts,
} from "@abacus-network/sdk";
import { Wallet } from "ethers";

async function main() {
  console.info("Getting signer");
  const signer = new Wallet("SET KEY HERE OR CREATE YOUR OWN SIGNER");

  console.info("Preparing utilities");
  const chainProviders = objMap(prodConfigs, (_, config) => ({
    provider: config.provider,
    confirmations: config.confirmations,
    overrides: config.overrides,
  }));
  const multiProvider = new MultiProvider(chainProviders);

  const core = AbacusCore.fromEnvironment("testnet2", multiProvider);
  const config = core.extendWithConnectionClientConfig(
    getChainToOwnerMap(prodConfigs, signer.address)
  );

  const deployer = new HyperswapDeployer(multiProvider, config, core);
  const chainToContracts = await deployer.deploy();
  const addresses = serializeContracts(chainToContracts);
  console.info("===Contract Addresses===");
  console.info(JSON.stringify(addresses));
}

main()
  .then(() => console.info("Deploy complete"))
  .catch(console.error);
