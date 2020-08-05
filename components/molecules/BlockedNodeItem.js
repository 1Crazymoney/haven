import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import * as _ from 'lodash';
import decode from 'unescape';

import { foregroundColor, linkTextColor } from '../commonColors';
import { cellStyles } from '../../utils/styles';

const styles = {
  wrapper: {
    height: 64,
    backgroundColor: foregroundColor,
    paddingHorizontal: 16,
  },
  handle: {
    fontSize: 16,
    color: 'black',
  },
  button: {
    width: 64,
  },
  buttonText: {
    fontSize: 16,
    color: linkTextColor,
    textAlign: 'right',
  },
  textWrapper: {
    flex: 1,
  },
};

export default ({
  item, profile, style, onPress, onToggle,
}) => {
  const { blocked } = item;
  return (
    <View style={[styles.wrapper, style]} onPress={!blocked ? onPress : null}>
      <View style={[cellStyles.contentContainer]}>
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={styles.textWrapper}>
            <Text style={styles.handle} numberOfLines={1}>
              {decode(_.get(profile, 'name') || 'Unknown')}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onToggle}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{blocked ? 'Unblock' : 'Block'}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={cellStyles.separator} />
    </View>
  );
};
