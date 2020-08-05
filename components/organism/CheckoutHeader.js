import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import decode from 'unescape';
import FastImage from 'react-native-fast-image';
import { get } from 'lodash';

import QuantitySelector from '../molecules/QuantitySelector';

import { getImageSourceWithDefault } from '../../utils/files';
import { primaryTextColor, secondaryTextColor } from '../commonColors';
import { priceStyle } from '../commonStyles';
import { convertorsMap } from '../../selectors/currency';
import { fetchProfile } from '../../reducers/profile';
import { getListingActualPrice } from '../../utils/stockManage';

const styles = {
  wrapper: {
    backgroundColor: '#ffffff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    width: 110,
    height: 110,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 2,
    shadowOpacity: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: primaryTextColor,
  },
  handle: {
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: secondaryTextColor,
  },
  priceWrapper: {
    marginTop: 6,
  },
};

class CheckoutHeader extends PureComponent {
  static getDerivedStateFromProps(props) {
    const { listing, profiles } = props;
    const { peerID } = listing.listing.vendorID;
    return { profile: profiles && profiles[peerID] };
  }

  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      quantity: props.quantity,
    };
  }

  componentDidMount() {
    if (!this.props.profile) {
      const { listing, fetchProfile } = this.props;
      const { peerID } = listing.listing.vendorID;
      fetchProfile({ peerID, getLoaded: true });
    }
  }

  render() {
    const { listing, onChange, localLabelFromBCH } = this.props;
    const { item } = listing.listing;
    const { title, images, priceCurrency = {} } = item;
    const { code: currency } = priceCurrency;

    const image = images[0].tiny;
    const { profile = {}, quantity } = this.state;

    const sellerName = get(profile, 'name', 'Anonymous');

    return (
      <View style={styles.wrapper}>
        <View style={styles.imageWrapper}>
          <FastImage
            source={getImageSourceWithDefault(image)}
            style={styles.image}
          />
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.name} numberOfLines={2}>
            {decode(title)}
          </Text>
          <Text style={styles.handle}>{`from ${decode(sellerName)}`}</Text>
          <View style={styles.priceWrapper}>
            <Text style={priceStyle}>
              {localLabelFromBCH(getListingActualPrice(this.props, true), currency)} / each
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <QuantitySelector
            value={quantity}
            onChange={(quantity) => {
              this.setState({ quantity }, () => onChange(this.state.quantity));
            }}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  profiles: state.profiles,
  ...convertorsMap(state),
});

const mapDispatchToProps = {
  fetchProfile,
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutHeader);
