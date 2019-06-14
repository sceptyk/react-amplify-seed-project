import React, { Component } from 'react';

import { Button } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import injectSheet from 'react-jss';
import styles from './StyledButton.style';

export class StyledButton extends Component {
  render() {
    const { classes, color, ...rest } = this.props;

    return (
      <Button
        {...rest}
        className={classNames({
          [classes.primary]: color === 'green',
          [classes.secondary]: color === 'blue',
          [classes.white]: color === 'white'
        })}
      />
    );
  }
}

export default injectSheet(styles)(StyledButton);
