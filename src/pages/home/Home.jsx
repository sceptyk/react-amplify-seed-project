import { Col, Row, Typography } from 'antd';
import React, { Component } from 'react';

import injectSheet from 'react-jss';
import styles from './Home.style';

class Home extends Component {
  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography>Home</Typography>
        </Col>
      </Row>
    );
  }
}

export default injectSheet(styles)(Home);
