// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import { getCustomNetwork } from '.';
import { getNetwork, Network, NetworkId } from '@iota/iota-sdk/client';
import { getAddressUrl, getObjectUrl, getTransactionUrl, getValidatorUrl } from '.';

export enum ExplorerLinkType {
    Address = 'address',
    Object = 'object',
    Transaction = 'transaction',
    Validator = 'validator',
}


export type ExplorerLinkConfig =
    | {
          type: ExplorerLinkType.Address;
          address?: string;
          useActiveAddress?: false;
      }
    | {
          type: ExplorerLinkType.Address;
          useActiveAddress: true;
      }
    | { type: ExplorerLinkType.Object; objectID: string; moduleName?: string }
    | { type: ExplorerLinkType.Transaction; transactionID: string }
    | { type: ExplorerLinkType.Validator; validator: string };

function getAddress(linkConfig: ExplorerLinkConfig, activeAddress: string | null) {
    const { type } = linkConfig;
    const isAddress = type === ExplorerLinkType.Address;
    const isProvidedAddress = isAddress && !linkConfig.useActiveAddress;
    return isProvidedAddress ? linkConfig.address : activeAddress;
}

export function getExplorerLink(
    linkConfig: ExplorerLinkConfig,
    activeAddress: string | null,
    network: NetworkId,
) {
    const { type } = linkConfig;
    const address = getAddress(linkConfig, activeAddress);
    const objectID = type === ExplorerLinkType.Object ? linkConfig.objectID : null;
    const transactionID = type === ExplorerLinkType.Transaction ? linkConfig.transactionID : null;
    const validator = type === ExplorerLinkType.Validator ? linkConfig.validator : null;
    const moduleName = type === ExplorerLinkType.Object ? linkConfig.moduleName : null;

    // fallback to localhost if customRPC is not set
    const customExplorer =
        network === Network.Custom ? getCustomNetwork().explorer : getNetwork(network).explorer;

    if (!address) return null;
    switch (type) {
        case ExplorerLinkType.Address:
            return address && getAddressUrl(address, network, customExplorer);
        case ExplorerLinkType.Object:
            return objectID && getObjectUrl(objectID, network, customExplorer, moduleName);
        case ExplorerLinkType.Transaction:
            return transactionID && getTransactionUrl(transactionID, network, customExplorer);
        case ExplorerLinkType.Validator:
            return validator && getValidatorUrl(validator, network, customExplorer);
    }
}
