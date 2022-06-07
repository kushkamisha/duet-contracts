import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import config from '../config';
// eslint-disable-next-line node/no-unpublished-import
import { useLogger } from '../scripts/utils';
import { HardhatDeployRuntimeEnvironment } from '../types/hardhat-deploy';
import { writeExtraMeta, useNetworkName } from './.defines';

enum Names {
  ExtendableBondAdmin = 'ExtendableBondAdmin',
  ExtendableBondedCakeReader = 'ExtendableBondedCakeReader',
}

const gasLimit = 3000000;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const logger = useLogger(__filename);
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre as unknown as HardhatDeployRuntimeEnvironment;
  const { deploy, get, execute } = deployments;

  const networkName = useNetworkName()
  const { deployer } = await getNamedAccounts();

  const extendableBondAdmin = await deploy(Names.ExtendableBondAdmin, {
    from: deployer,
    contract: Names.ExtendableBondAdmin,
    args: [deployer],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
  logger.info(`[deployed] ${Names.ExtendableBondAdmin}`, extendableBondAdmin.address);
  await writeExtraMeta(Names.ExtendableBondAdmin, { class: Names.ExtendableBondAdmin, instance: Names.ExtendableBondAdmin })

  const extendableBondedCakeReader = await deploy(Names.ExtendableBondedCakeReader, {
    from: deployer,
    contract: Names.ExtendableBondedCakeReader,
    args: [
      extendableBondAdmin.address,
      config.address.CakePool[networkName], config.address.CakeMasterChefV2[networkName],
      config.address.PancakeLpTokenPair__CAKE_BUSD[networkName],
      config.address.PancakeLpTokenPair__DUET_BUSD[networkName] || ZERO_ADDRESS,
      config.address.PancakeLpTokenPair__DUET_CAKE[networkName] || ZERO_ADDRESS,
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
  logger.info(`[deployed] ${Names.ExtendableBondedCakeReader}`, extendableBondedCakeReader.address);
  await writeExtraMeta(Names.ExtendableBondedCakeReader, { class: Names.ExtendableBondedCakeReader, instance: Names.ExtendableBondedCakeReader })

};
export default func;
