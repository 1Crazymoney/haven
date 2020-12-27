import React from 'react';
import { Text, ScrollView } from 'react-native';

import NavCloseButton from '../atoms/NavCloseButton';
import DescriptionText from '../atoms/DescriptionText';
import Button from '../atoms/FullButton';
import Header from '../molecules/Header';
import { OBLightModal } from '../templates/OBModal';

import InputGroup from '../atoms/InputGroup';

const styles = {
  contentWrapper: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonWrapper: {
    marginBottom: 10,
  },
};

const scrollStyleProps = {
  style: {
    flex: 1,
  },
  // showsVerticalScrollIndicator: false,
};

export default class CovidModal extends React.Component {
  render() {
    const { show, onClose, onCreateListing } = this.props;
    return (
      <OBLightModal
        animationType="slide"
        transparent
        visible={show}
        onRequestClose={onClose}
      >
        <Header
          left={<NavCloseButton />}
          modal
          onLeft={onClose}
        />
        <InputGroup
          wrapperStyle={styles.contentWrapper}
          contentStyle={styles.contentWrapper}
          title={I18n.t('components.organism.CovidModal.input_groupon_title')}
          noBorder
        >
          <ScrollView {...scrollStyleProps}>
            <DescriptionText>
                {I18n.t('components.organism.CovidModal.description11')}                
              <Text style={styles.bold}> {I18n.t('components.organism.CovidModal.description12')}</Text>
                {I18n.t('components.organism.CovidModal.description13')}                
            </DescriptionText>
            <DescriptionText>
                {I18n.t('components.organism.CovidModal.description21')}                
              <Text style={styles.bold}> {I18n.t('components.organism.CovidModal.description22')}</Text>
                {I18n.t('components.organism.CovidModal.description23')}
              <Text style={styles.bold}> {I18n.t('components.organism.CovidModal.description214')}</Text>
                {I18n.t('components.organism.CovidModal.description25')}
            </DescriptionText>
            <DescriptionText>
                {I18n.t('components.organism.CovidModal.description31')}                
            </DescriptionText>
          </ScrollView>
        </InputGroup>
        <Button
          title={I18n.t('components.organism.CovidModal.create_listing_title')}
          wrapperStyle={styles.buttonWrapper}
          onPress={onCreateListing}
          style={styles.firstButton}
        />
      </OBLightModal>
    );
  }
}
