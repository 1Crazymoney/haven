import React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { isEmpty, get } from 'lodash';
import decode from 'unescape';

import AvatarImage from '../atoms/AvatarImage';
import { fetchProfile } from '../../reducers/profile';
import { timeSince } from '../../utils/time';

import { primaryTextColor, brandColor, formLabelColor } from '../commonColors';
import { eventTracker } from '../../utils/EventTracker';

import {I18n} from '../../langs/I18n';

const styles = {
  wrapper: {
    borderLeftWidth: 5,
    borderColor: 'transparent',
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  new: {
    backgroundColor: '#F1FBF2',
  },
  iconWrapper: {
    paddingRight: 12,
    paddingTop: 6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  textWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  primaryText: {
    marginTop: 6,
    marginLeft: 12,
    fontSize: 14,
    color: formLabelColor,
  },
  secondaryTextWrapper: {
    marginLeft: 12,
    marginTop: 6,
    paddingBottom: 2,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#989898',
  },
  secondaryText: {
    alignItems: 'center',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 14,
    paddingLeft: 10,
    color: formLabelColor,
  },
  text: {
    fontSize: 14,
    marginLeft: 10,
    color: primaryTextColor,
  },
  name: {
    fontWeight: '600',
  },
  timestamp: {
    width: 60,
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'right',
    color: '#8a8a8f',
  },
  avatarImage: {
    width: 35,
  },
};

class SocialNotification extends React.PureComponent {
  UNSAFE_componentWillMount() {
    const peerID = this.getPeerId();
    this.props.fetchProfile({ peerID, getLoaded: true });
  }

  getPeerId() {
    const { activities } = this.props.notification || {};
    const actor = get(activities, '[0].actor');
    let peerID = actor;
    if (typeof actor === 'object') {
      peerID = actor.id;
    }
    return peerID;
  }

  getProfile() {
    const { profiles } = this.props;
    const peerID = this.getPeerId();
    return profiles[peerID] || {};
  }

  getContentText() {
    const { verb } = this.props.notification || {};
    switch (verb) {
      case 'unfollow':
        return ' unfollowed you';
      case 'moderatorAdd':
        return ' is now one of your moderators';
      case 'moderatorRemove':
        return ' is removed from your moderator list';
      case 'like':
        return ' liked your post';
      case 'comment':
        return ' commented on your post';
      case 'repost':
        return ' reposted your post';
      case 'follow':
        return ' followed you';
      default:
        return '';
    }
  }

  getIcon() {
    const { verb } = this.props.notification || {};
    switch (verb) {
      case 'unfollow':
        return <Feather size={22} color={brandColor} name="user-x" />;
      case 'moderatorAdd':
        return <Feather size={22} color={brandColor} name="user-plus" />;
      case 'moderatorRemove':
        return <Feather size={22} color={brandColor} name="user-minus" />;
      case 'like':
        return <Feather size={22} color={brandColor} name="heart" />;
      case 'comment':
        return <Feather size={22} color={brandColor} name="message-square" />;
      case 'repost':
        return <Feather size={22} color={brandColor} name="repeat" />;
      case 'follow':
        return <Feather size={22} color={brandColor} name="user-check" />;
      default:
        return '';
    }
  }

  handlePress = () => {
    const { notification = {}, navigation } = this.props;
    const { activities, verb } = notification;
    const { actor, object } = get(activities, '[0]', {});
    let peerID = actor;
    if (typeof actor === 'object') {
      peerID = actor.id;
    }
    eventTracker.trackEvent('Notification-TappedNotification', { orderType: 'social', category: verb });
    if (verb === 'follow' || verb === 'unfollow') {
      navigation.navigate('ExternalStore', { peerID });
    } else {
      try {
        const { content } = JSON.parse(object);
        const activityId = content.activityId;
        navigation.navigate('FeedDetail', { activityId, tab: verb, showKeyboard: false });
      } catch {
        navigation.navigate('FeedDetail', { activityId: object.id, tab: verb, showKeyboard: false });
      }
    }
  };

  getContent = () => {
    try {
      const { activities } = this.props.notification || {};
      const parsedObject = JSON.parse(get(activities, '[0].object', '{}'));
      return parsedObject.content;
    } catch (_) {
      return null;
    }
  }

  renderContent() {
    const profile = this.getProfile();
    const thumbnail = get(profile, 'avatarHashes.small', '');
    const name = get(profile, 'name', '');

    const { is_seen, created_at, verb } = this.props.notification || {};
    const content = this.getContent() || {};

    const { primaryText = '', secondaryText = '', comment = '' } = content;
    const noText = primaryText === '' && secondaryText === '' && comment === '';

    return (
      <TouchableWithoutFeedback onPress={this.handlePress}>
        <View style={[styles.wrapper, !is_seen && styles.new]}>
          <View style={styles.iconWrapper}>
            {this.getIcon()}
          </View>
          <View style={[styles.content, noText && styles.center]}>
            <AvatarImage style={styles.avatarImage} thumbnail={thumbnail} />
            <View style={styles.textWrapper}>
              <Text style={styles.text}>
                <Text style={styles.name}>{decode(name)}</Text>
                {this.getContentText()}
              </Text>
              {verb !== 'like' && verb !== 'repost' && primaryText !== '' && (
                <Text numberOfLines={2} ellipsizeMode="tail" style={styles.primaryText}>{decode(primaryText)}</Text>
              )}
              {verb !== 'like' && (secondaryText !== '' || comment !== '') && (
                <View style={styles.secondaryTextWrapper}>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.secondaryText}
                  >
                    {decode(secondaryText === '' ? comment : secondaryText)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.timestamp}>{timeSince(new Date(created_at).getTime())}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  render() {
    const profile = this.getProfile();
    if (isEmpty(profile)) {
      return false;
    }
    return this.renderContent();
  }
}

const mapStateToProps = ({ profiles }) => ({ profiles });
const mapDispatchToProps = { fetchProfile };

export default withNavigation(connect(
  mapStateToProps,
  mapDispatchToProps,
)(SocialNotification));
