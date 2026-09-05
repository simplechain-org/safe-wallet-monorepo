import type { ContractAddresses } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

const CUSTOM_CHAIN_DEPLOYMENTS: Record<string, ContractAddresses> = {
  '167901': {
    safeSingletonAddress: '0x3C634a4C3c705772a5215ed9E425166D1FD582B0',
    safeProxyFactoryAddress: '0xB660500Aa51CFE07318D421db963447F1eb700b0',
    multiSendAddress: '0x8A7B9f567760A6e673d2fE524E29f15eeeE521d4',
    multiSendCallOnlyAddress: '0x2312E9418239eCD15b04090794C9e91052a61313',
    fallbackHandlerAddress: '0x67f206Acd3b665FE2BA4a9b6e79f568fCD8148b0',
    signMessageLibAddress: '0x8d157e7d8da0FFfC78220fFbd2C0a971D5d8C652',
    createCallAddress: '0x9245caB71fb45B91fFdC9C001C07c8E5F52ef3e5',
    simulateTxAccessorAddress: '0xaEA65cBBE6f842701fd191C8CE7A6C4c01f3B7ec',
  },
}

export const applyCustomChainDeployments = <T extends { chainId: string; contractAddresses?: ContractAddresses | null }>(
  chain: T,
): T => {
  const customDeployments = CUSTOM_CHAIN_DEPLOYMENTS[chain.chainId]

  if (!customDeployments) {
    return chain
  }

  return {
    ...chain,
    contractAddresses: {
      ...customDeployments,
      ...chain.contractAddresses,
    },
  }
}
