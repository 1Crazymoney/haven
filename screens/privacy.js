import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Platform, View, Image, Text, TouchableWithoutFeedback, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as _ from 'lodash';
import Hyperlink from 'react-native-hyperlink';
import { WebView } from 'react-native-webview';

import { brandColor, formLabelColor } from '../components/commonColors';
import Button from '../components/atoms/FullButton';
import { screenWrapper, onboardingStyles, footerStyles } from '../utils/styles';

import { setProfile, updateAcceptedCoins } from '../reducers/profile';
import { setSettings } from '../reducers/settings';
import { setOnboardingStatus, setGuest, initializeLogin, appInstalled } from '../reducers/appstate';
import { createProfile, createSettings } from '../api/onboarding';
import NavBackButton from '../components/atoms/NavBackButton';
import { StatusBarSpacer } from '../status-bar';
import { OBLightModal } from '../components/templates/OBModal';
import Header from '../components/molecules/Header';
import NavCloseButton from '../components/atoms/NavCloseButton';
import { navHeightStyle } from '../utils/navbar';
import { COINS } from '../utils/coins';
import { eventTracker } from '../utils/EventTracker';

import StreamClient from '../StreamClient';

const shieldImg = require('../assets/images/privacyShield.png');
const bottomImg = require('../assets/images/privacyBottom.png');

const styles = {
  logo: {
    width: 47,
    height: 52,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 13,
    color: 'white',
    backgroundColor: '#8cd885',
    left: 16,
    paddingLeft: 11,
    paddingRight: 9,
    paddingTop: 7,
    paddingBottom: 5,
    letterSpacing: 1,
    borderRadius: 13,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: -13,
  },
  privacyDescription1: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 26,
    color: '#404040',
  },
  privacyDescription2: {
    marginTop: 26,
    fontSize: 16,
    lineHeight: 26,
    color: '#404040',
  },
  backBtn: {
    position: 'absolute',
    width: 32,
    height: navHeightStyle.height,
    justifyContent: 'center',
    alignItems: 'flex-start',
    left: 8,
    top: 0,
    zIndex: 999,
  },
  hyperlinkContainer: {
    paddingHorizontal: 16,
  },
  privacyButtonText: {
    color: brandColor,
    textDecorationLine: 'underline',
  },
  bottomImg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  activityIndicator: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewWrapper: {
    paddingHorizontal: 6,
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  cancelButton: {
    fontSize: 16,
    color: formLabelColor,
  },
};

class Privacy extends PureComponent {
  state = {
    loggingIn: false,
    showSpinner: true,
  }

  handleGetStarted = async () => {
    const { navigation } = this.props;
    const {
      setOnboardingStatus, setProfile, setSettings, setGuest, initializeLogin, appInstalled, updateAcceptedCoins,
    } = this.props;
    const { name, country, currency } = navigation.getParam('params');
    this.setState({ loggingIn: true });

    const profileName = name || 'Anonymous';
    const countryValue = country.value.toUpperCase();
    const currencyCode = currency.code;
    appInstalled();
    try {
      const settings = await createSettings(countryValue, currencyCode);
      setSettings(settings);
      const profile = await createProfile(profileName);
      setProfile(profile);
      setOnboardingStatus('loggedIn');
      updateAcceptedCoins({ coins: Object.keys(COINS) });
      initializeLogin();
    } catch (error) {
      this.setState({ loggingIn: false });
    } finally {
      setGuest({
        name: profileName,
        country: countryValue,
        localCurrency: currencyCode,
      });
    }

    eventTracker.trackEvent('Onboarding-CompletedOnboarding');
  };

  handleGoBack = () => this.props.navigation.goBack()

  handleShowModal = (url) => {
    this.setState({ urlInModal: url });
  };

  handleHideModal = () => {
    this.setState({ urlInModal: null });
  };

  handleHideSpinner = () => {
    this.setState({ showSpinner: false });
  }

  handleLinkText = (url) => {
    if (url === 'https://gethaven.app/privacy') {
      return 'Privacy Policy';
    } else if (url === 'https://gethaven.app/terms') {
      return 'Terms of Service';
    }
    return url;
  }

  render() {
    const { loggingIn, urlInModal, showSpinner } = this.state;
    return (
      <View style={screenWrapper.wrapper}>
        <Image style={styles.bottomImg} source={bottomImg} resizeMode="contain" />
        <View style={onboardingStyles.header}>
          <StatusBarSpacer />
          <View style={onboardingStyles.headerContent}>
            <TouchableWithoutFeedback onPress={this.handleGoBack}>
              <View style={styles.backBtn}>
                <NavBackButton />
              </View>
            </TouchableWithoutFeedback>
            <Image style={styles.logo} source={shieldImg} resizeMode="contain" />
          </View>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <View>
            <Text style={[styles.privacyText]}>
              PRIVACY
            </Text>
            <Hyperlink
              style={styles.hyperlinkContainer}
              linkStyle={styles.privacyButtonText}
              linkText={this.handleLinkText}
              onPress={this.handleShowModal}
            >
              <Text style={styles.privacyDescription1}>
                Haven is built to give you far more privacy in your commerce, messaging, and payments than other apps.
                It uses several advanced technologies to keep your information from prying eyes, such as peer-to-peer networking and end-to-end encryption.
              </Text>
              <Text style={styles.privacyDescription2}>
                There are ways to use Haven which improve or diminish your privacy.
                To learn more about how the underlying technology works, and what steps you can take to improve your privacy,
                {' '}
                tap the privacy policy link below.
              </Text>
              <Text style={styles.privacyDescription2}>
                Before you proceed, you must accept the Haven https://gethaven.app/terms and https://gethaven.app/privacy.
              </Text>
            </Hyperlink>
          </View>
          <View style={footerStyles.roundButtonContainer}>
            <TouchableWithoutFeedback onPress={this.handleGoBack}>
              <View>
                <Text style={styles.cancelButton}>Cancel</Text>
              </View>
            </TouchableWithoutFeedback>
            <Button
              wrapperStyle={onboardingStyles.button}
              title="I Accept"
              onPress={this.handleGetStarted}
              disabled={loggingIn}
            />
          </View>
        </ScrollView>
        <OBLightModal
          animationType="slide"
          transparent
          visible={!!urlInModal}
          onRequestClose={this.handleHideModal}
        >
          <Header modal left={<NavCloseButton />} onLeft={this.handleHideModal} />
          <View style={styles.webviewWrapper}>
            <WebView
              onLoadStart={this.handleHideSpinner}
              onError={this.handleHideSpinner}
              originWhitelist={['*']}
              source={{ uri: urlInModal }}
              scalesPageToFit={Platform.OS === 'android'}
              automaticallyAdjustContentInsets
              useWebKit={false}
            />
          </View>
          {showSpinner && (
            <View style={styles.activityIndicator}>
              <ActivityIndicator size="large" color="#8a8a8f" />
            </View>
          )}
        </OBLightModal>
      </View>
    );
  }
}

const mapDispatchToProps = {
  setProfile,
  updateAcceptedCoins,
  setSettings,
  setOnboardingStatus,
  appInstalled,
  setGuest,
  initializeLogin,
};

export default connect(
  null,
  mapDispatchToProps,
)(Privacy);
