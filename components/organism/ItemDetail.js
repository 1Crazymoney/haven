/* eslint-disable no-return-assign */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Platform } from 'react-native';
import { withNavigation } from 'react-navigation';
import he from 'he';

import { setBasicInfo } from '../../reducers/createListing';
import { convertorsMap } from '../../selectors/currency';

import InputGroup from '../atoms/InputGroup';
import TextInput from '../atoms/TextInput';
import CheckBox from '../atoms/CheckBox';
import RadioModalFilter from '../molecules/RadioModalFilter';
import productConditions from '../../config/productCondition.json';
import prodTypes from '../../config/productTypes.json';
import iosProdTypes from '../../config/iosProductTypes.json';
import { eventTracker } from '../../utils/EventTracker';
import CategorySelector from './CategorySelector';
import { getFixedCurrency } from '../../utils/currency';

const showingProdTypes = Platform.OS === 'ios' ?
  iosProdTypes.slice(1, iosProdTypes.length) : prodTypes.slice(1, prodTypes.length);

class ItemDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      title, description, price, nsfw, categories, localDecimalPointsIfCrypto,
    } = props;
    this.state = {
      title,
      description: he.decode(description),
      price: price === '0' ? undefined : getFixedCurrency(parseFloat(price) || 0.0, localDecimalPointsIfCrypto || 2),
      nsfw,
      categories,
    };
  }

  onChangeType = (type) => {
    eventTracker.trackEvent('CreateListing-ChangeType', { type });
    this.props.setBasicInfo({ type });
  };

  onChangeTitle = (title) => {
    this.setState({ title }, () => { this.props.setBasicInfo(this.state); });
  };

  onChangePrice = (formated, price) => {
    this.setState({ price }, () => { this.props.setBasicInfo(this.state); });
  };

  onChangeCondition = (condition) => {
    eventTracker.trackEvent('CreateListing-ChangeCondition', { condition });
    this.props.setBasicInfo({ condition });
  };

  onChangeDescription = (description) => {
    this.setState({ description }, () => { this.props.setBasicInfo(this.state); });
  };

  onChangeNsfw = () => {
    const { nsfw } = this.state;
    this.setState({ nsfw: !nsfw }, () => { this.props.setBasicInfo(this.state); });
  };

  handleDescriptionFocus = () => {
    const { onFocusItem } = this.props;
    if (onFocusItem) {
      onFocusItem(this.descriptionInput);
    }
  }

  handleChangeCategory = (category, subCategory) => {
    const { setBasicInfo } = this.props;
    if (subCategory) {
      setBasicInfo({ categories: [category, subCategory] });
    } else {
      setBasicInfo({ categories: [] });
    }
  }

  render() {
    const {
      type, condition, localCurrency, localSymbol, productType, categories, localMask,
    } = this.props;
    const {
      title, description, price, nsfw,
    } = this.state;
    return (
      <InputGroup title="Listing">
        <RadioModalFilter
          title="Type"
          required
          secondary
          selected={type}
          options={showingProdTypes}
          hasBorder
          onChange={this.onChangeType}
        />
        <TextInput
          title="Title"
          required
          placeholder="What are you selling?"
          value={title}
          onChangeText={this.onChangeTitle}
        />
        <TextInput
          title="Price"
          required
          value={price}
          onChangeText={this.onChangePrice}
          unit={localCurrency}
          mask={localMask}
          placeholder={`${localSymbol}0`}
          keyboardType="decimal-pad"
        />
        <CategorySelector onChangeCategory={this.handleChangeCategory} categories={categories} />
        {(productType.value === 'physical_good' || productType === 'physical_good') && (
          <RadioModalFilter
            title="Condition"
            secondary
            selected={condition}
            options={productConditions.slice(1, productConditions.length)}
            hasBorder
            onChange={this.onChangeCondition}
          />
        )}
        <TextInput
          ref={r => (this.descriptionInput = r)}
          title="Description"
          multiline
          noTitle
          placeholder="Describe your listing here"
          value={description}
          onChangeText={this.onChangeDescription}
          onFocus={this.handleDescriptionFocus}
        />
        <CheckBox
          checked={nsfw}
          title="Mature Content (NSFW, adult, 18+)"
          onPress={this.onChangeNsfw}
        />
      </InputGroup>
    );
  }
}

const mapStateToProps = state => ({
  title: state.createListing.title,
  description: state.createListing.description,
  price: state.createListing.price,
  type: state.createListing.type,
  condition: state.createListing.condition,
  categories: state.createListing.categories,
  nsfw: state.createListing.nsfw,
  localCurrency: state.settings.localCurrency,
  productType: state.createListing.type,
  ...convertorsMap(state),
});

const mapDispatchToProps = {
  setBasicInfo,
};

export default withNavigation(connect(
  mapStateToProps,
  mapDispatchToProps,
)(ItemDetail));
