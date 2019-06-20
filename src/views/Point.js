import React, { useCallback } from 'react';
import * as need from 'lib/need';
import { Grid } from 'indigo-react';

import { usePointCursor } from 'store/pointCursor';
// import { usePointCache } from 'store/pointCache';

import View from 'components/View';
import Passport from 'components/Passport';
import { ForwardButton } from 'components/Buttons';
import Footer from 'components/Footer';

import useInvites from 'lib/useInvites';
import useSyncPoint from 'lib/useSyncPoint';
import { ROUTE_NAMES } from 'lib/routeNames';

import { useHistory } from 'store/history';

export default function Point() {
  const history = useHistory();
  const { pointCursor } = usePointCursor();
  // const { pointCache } = usePointCache();

  const point = need.pointCursor(pointCursor);

  // fetch the invites for the current cursor
  const { invites } = useInvites(point);

  const goAdmin = useCallback(() => {}, []);
  // ^ TODO: push .ADMIN
  const goInvite = useCallback(() => history.push(ROUTE_NAMES.INVITES_MANAGE), [
    history,
  ]);

  // sync the current cursor
  useSyncPoint(point);

  // const pointDetails = need.fromPointCache(pointCache, point);

  return (
    <View>
      <Passport point={point} />
      <Grid className="pt2">
        <Grid.Item full>
          <ForwardButton onClick={goAdmin}>Admin</ForwardButton>
        </Grid.Item>
        <Grid.Divider />
        <Grid.Item full>
          <ForwardButton detail="Boot your computer" disabled>
            Boot Arvo
          </ForwardButton>
        </Grid.Item>
      </Grid>
      <Footer>
        <Grid className="pt2">
          <Grid.Divider />
          <Grid.Item full>
            <ForwardButton onClick={goInvite}>
              Invite
              {invites.matchWith({
                Nothing: () => null,
                Just: p => <sup className="ml1">{p.value}</sup>,
              })}
            </ForwardButton>
          </Grid.Item>
        </Grid>
      </Footer>
    </View>
  );
}
