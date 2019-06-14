import { Col, Row, Typography } from 'antd';
import React, { Component } from 'react';

import injectSheet from 'react-jss';
import styles from './Dashboard.style';

class Dashboard extends Component {
  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography>Dashboard</Typography>
        </Col>
      </Row>
    );
  }
}

export default injectSheet(styles)(Dashboard);
