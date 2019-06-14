import React, { Component } from 'react';
import styles from './Spacer.style';
import injectSheet from 'react-jss';
import classNames from 'classnames';
import PropTypes from 'prop-types';

class Spacer extends Component {
  render() {
    const { classes, size } = this.props;

    return (
      <div
        className={classNames({
          [classes.base]: true,
          [classes.small]: size === 'small',
          [classes.default]: size === 'default',
          [classes.large]: size === 'large'
        })}
      />
    );
  }
}

Spacer.defaultProps = {
  size: 'default'
};

Spacer.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large'])
};

export default injectSheet(styles)(Spacer);
