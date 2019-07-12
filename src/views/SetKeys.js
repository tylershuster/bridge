import React from 'react';
import { Just, Nothing } from 'folktale/maybe';
import * as azimuth from 'azimuth-js';
import * as ob from 'urbit-ob';
import * as need from '../lib/need';
import * as kg from 'urbit-key-generation/dist';
import { H1, P, Warning, CheckboxButton } from '../components/old/Base';

import StatelessTransaction from '../components/old/StatelessTransaction';
import { attemptNetworkSeedDerivation } from '../lib/keys';

import { addHexPrefix } from '../lib/wallet';
import { compose } from '../lib/lib';

import { withNetwork } from '../store/network';
import { withWallet } from '../store/wallet';
import { withPointCursor } from '../store/pointCursor';
import { withPointCache } from '../store/pointCache';
import View from 'components/View';

class SetKeys extends React.Component {
  constructor(props) {
    super(props);

    const point = need.point(props.pointCursor);

    this.state = {
      auth: '',
      encr: '',
      newNetworkSeed: '',
      nondeterministicSeed: false,
      point: point,
      cryptoSuiteVersion: 1,
      discontinuity: false,
      isManagementSeed: false,
    };

    this.toggleDiscontinuity = this.toggleDiscontinuity.bind(this);
    // Transaction
    this.createUnsignedTxn = this.createUnsignedTxn.bind(this);
  }

  toggleDiscontinuity() {
    this.setState({ discontinuity: !this.state.discontinuity });
  }

  componentDidMount() {
    const { props } = this;

    this.deriveSeed();

    const addr = need.addressFromWallet(props.wallet);

    this.determineManagementSeed(props.contracts.value, addr);
  }

  async determineManagementSeed(ctrcs, addr) {
    const managing = await azimuth.azimuth.getManagerFor(ctrcs, addr);

    this.setState({
      isManagementSeed: managing.length !== 0,
    });
  }

  //TODO use web3.utils.randomHex when it gets fixed, see web3.js#1490
  randomHex(len) {
    let hex = '';

    for (var i = 0; i < len; i++) {
      hex =
        hex +
        [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
        ][Math.floor(Math.random() * 16)];
    }

    return hex;
  }

  async deriveSeed() {
    const next = true;
    let nondeterministicSeed = false;

    const seed = await attemptNetworkSeedDerivation(next, this.props);
    const newNetworkSeed = seed.matchWith({
      Nothing: () => {
        nondeterministicSeed = true;
        return this.randomHex(64);
      },
      Just: p => p.value,
    });

    this.setState({
      newNetworkSeed,
      nondeterministicSeed,
    });
  }

  createUnsignedTxn() {
    const { state, props } = this;

    const validContracts = need.contracts(props.contracts);
    const validPoint = need.point(props.pointCursor);

    // TODO: move this to a lib for validating things
    const hexRegExp = /[0-9A-Fa-f]{64}/g;

    if (hexRegExp.test(state.newNetworkSeed)) {
      // derive network keys
      const pair = kg.deriveNetworkKeys(state.newNetworkSeed);

      const pencr = addHexPrefix(pair.crypt.public);
      const pauth = addHexPrefix(pair.auth.public);

      const txn = azimuth.ecliptic.configureKeys(
        validContracts,
        validPoint,
        pencr,
        pauth,
        1,
        state.discontinuity
      );

      return Just(txn);
    }

    return Nothing();
  }

  render() {
    const { props, state } = this;

    const canGenerate =
      state.newNetworkSeed.length === 64 && state.newNetworkSeed.length === 64;

    const pointDetails = need.fromPointCache(props.pointCache, state.point);

    return (
      <View>
        <H1>
          {'Set Network Keys For '} <code>{`${ob.patp(state.point)}`}</code>
        </H1>

        <P className="mt-10">
          {`Set new authentication and encryption keys for your Arvo ship.`}
        </P>

        {state.nondeterministicSeed && (
          <Warning>
            <h3 className={'mb-2'}>{'Warning'}</h3>
            {`Your network seed could not be derived automatically. We've
                generated a random one for you, so you must download your Arvo
                keyfile during this session after setting your keys.`}
          </Warning>
        )}

        {pointDetails.keyRevisionNumber === 0 ? (
          <Warning>
            <h3 className={'mb-2'}>{'Warning'}</h3>
            {'Once these keys have been set, your point is considered ' +
              "'linked'.  This operation cannot be undone."}
          </Warning>
        ) : (
          <div />
        )}

        <CheckboxButton
          className="mt-8"
          onToggle={this.toggleDiscontinuity}
          state={state.discontinuity}
          label={`I have lost important off-chain data relating to this point
                    and need to do a hard reset.
                    (For example, rebooting an Arvo ship.)`}
        />

        <StatelessTransaction
          // Upper scope
          {...props}
          // Tx
          canGenerate={canGenerate}
          createUnsignedTxn={this.createUnsignedTxn}
          newNetworkSeed={state.newNetworkSeed}
          newRevision={parseInt(pointDetails.keyRevisionNumber) + 1}
        />
      </View>
    );
  }
}

export default compose(
  withNetwork,
  withWallet,
  withPointCursor,
  withPointCache
)(SetKeys);