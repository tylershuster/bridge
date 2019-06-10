import { Just, Nothing } from 'folktale/maybe'
import React from 'react'
import * as ob from 'urbit-ob'
import * as azimuth from 'azimuth-js'

import { BRIDGE_ERROR } from '../lib/error'
import { sendMail } from '../lib/inviteMail'
import { Row, Col, Input, InnerLabel } from '../components/Base'
import StatelessTransaction from '../components/StatelessTransaction'

// for wallet generation
import * as wg from '../../walletgen/lib/lib'

class InvitesSend extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      invitesAvailable: Nothing(),
      fromPool: Nothing(),
      haveInvited: Nothing(),
      randomPlanet: Nothing(),
      inviteWallet: Nothing(),
      targetEmail: ''
    }

    this.findInvited = this.findInvited.bind(this);
    this.findRandomPlanet = this.findRandomPlanet.bind(this);
    this.generateWallet = this.generateWallet.bind(this);
    this.canGenerate = this.canGenerate.bind(this);
    this.handleEmailInput = this.handleEmailInput.bind(this);
    this.txnConfirmation = this.txnConfirmation.bind(this);
    this.createUnsignedTxn = this.createUnsignedTxn.bind(this);
  }

  componentDidMount() {
    this.point = this.props.pointCursor.matchWith({
      Just: (pt) => parseInt(pt.value, 10),
      Nothing: () => {
        throw BRIDGE_ERROR.MISSING_POINT
      }
    });
    this.contracts = this.props.contracts.matchWith({
      Just: cs => cs.value,
      Nothing: _ => {
        throw BRIDGE_ERROR.MISSING_CONTRACTS
      }
    });

    azimuth.delegatedSending.getPool(this.contracts, this.point)
    .then(pool => {
      this.setState({fromPool: Just(pool)});
      azimuth.delegatedSending.invitesInPool(this.contracts, pool)
      .then(count => {
        this.setState({invitesAvailable: Just(count)});
      });
    });
    this.findInvited();
    this.findRandomPlanet();
    this.generateWallet();
  }

  componentDidUpdate(prevProps) {
    //
  }

  async findInvited() {
    let invited = await azimuth.delegatedSending.getInvited(
      this.contracts,
      this.point
    );
    invited = invited.map(async point => {
      const active = await azimuth.azimuth.isActive(this.contracts, point);
      const res = {point: Number(point), active:active};
      return res;
    });
    invited = await Promise.all(invited);
    this.setState({haveInvited: Just(invited)});
  }

  async findRandomPlanet() {
    let res = Nothing();
    const kids = await azimuth.azimuth.getUnspawnedChildren(
      this.contracts,
      azimuth.azimuth.getPrefix(this.point)
    );
    if (kids.length > 0) {
      const i = Math.floor(Math.random() * kids.length);
      res = Just(Number(kids[i]));
    }
    this.setState({randomPlanet: res});
    return res;
  }

  async generateWallet() {
    const ticket = await wg.makeTicket(0x10000); // planet-sized ticket
    const wallet = await wg.generateWallet(0, ticket, false);
    this.setState({inviteWallet:
      Just({ticket, owner:wallet.ownership.keys.address})
    });
  }

  handleEmailInput(email) {
    //TODO simple .*@.*\..* email validation
    this.setState({ targetEmail: email });
  }

  canGenerate() {
    //TODO and canSend()
    let res = this.state.invitesAvailable.matchWith({
      Nothing: () => false,
      Just: invites => ((invites.value > 0)
                        && Just.hasInstance(this.state.randomPlanet)
                        && Just.hasInstance(this.state.inviteWallet))
    });
    return res;
  }

  createUnsignedTxn() {
    const txn = azimuth.delegatedSending.sendPoint(
      this.contracts,
      this.point,
      this.state.randomPlanet.value,
      this.state.inviteWallet.value.owner
    );
    return Just(txn)
  }

  //TODO find a better way of making the user wait for submission success
  //     and email sending, so that we can catch failure cases and can
  //     always fall back to retrying or "please send them this"
  txnConfirmation(txHash, confirmations) {
    this.props.setTxnConfirmations(txHash, confirmations);
    if (confirmations === 1) {
      sendMail(this.state.targetEmail, this.state.inviteWallet.value.ticket)
      .then(console.log);
    }
  }

  render() {
    const inviteStatus = this.state.invitesAvailable.matchWith({
      Nothing: () => 'Loading...',
      Just: (invites) => {
        let res = `${invites.value} invites available`;
        return res + this.state.fromPool.matchWith({
          Nothing: () => '',
          Just: (pool) => (pool.value === this.point)
                          ? ''
                          : ` (from ${ob.patp(pool.value)})`
        });
      }
    });


    const inviteList = this.state.haveInvited.matchWith({
      Nothing: () => (<li>{'Loading...'}</li>),
      Just: (invited) => invited.value.map(i => {
        return (<li>
          <span class="invitee">{ob.patp(i.point)}</span>:
          <span class="status">{i.active ? 'accepted' : 'pending'}</span>
        </li>);
      })
    });

    return (
      <Row>
        <Col>

          <p>{ 'send invites here, for planets' }</p>

          <p>{ inviteStatus }</p>

          <ul>{ inviteList }</ul>

          <Input
            value={ this.state.targetEmail }
            onChange={ this.handleEmailInput }>
            <InnerLabel>
              { 'Recipient email' }
            </InnerLabel>
          </Input>

          <StatelessTransaction
            // Upper scope
            web3={this.props.web3}
            contracts={this.props.contracts}
            wallet={this.props.wallet}
            walletType={this.props.walletType}
            walletHdPath={this.props.walletHdPath}
            networkType={this.props.networkType}
            setTxnConfirmations={this.txnConfirmation}
            onSent={this.props.setTxnHashCursor}
            popRoute={this.props.popRoute}
            pushRoute={this.props.pushRoute}
            // Other
            canGenerate={this.canGenerate()}
            createUnsignedTxn={this.createUnsignedTxn}
            ref={this.statelessRef} />

        </Col>
      </Row>
    )
  }
}

export default InvitesSend