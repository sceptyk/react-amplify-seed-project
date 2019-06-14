import { Col, Layout, Row } from 'antd';
import React, { Component } from 'react';

import { Divider } from 'antd';
import injectSheet from 'react-jss';
import styles from './PageFooter.style';

class PageFooter extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Layout.Footer className={classes.wrapper}>
        <Row>
          <Col span={20} offset={2}>
            <Row type="flex" justify="start" className={classes.FooterLinks}>
              <Col>
                <ul>
                  <li className={classes.MenuItem}>item 1</li>
                  <li className={classes.MenuItem}>item 2</li>
                  <li className={classes.MenuItem}>item 3</li>
                </ul>
              </Col>
              <Col>
                <ul>
                  <li className={classes.MenuItem}>item 1</li>
                  <li className={classes.MenuItem}>item 2</li>
                  <li className={classes.MenuItem}>item 3</li>
                </ul>
              </Col>
              <Col>
                <ul>
                  <li className={classes.MenuItem}>item 1</li>
                  <li className={classes.MenuItem}>item 2</li>
                  <li className={classes.MenuItem}>item 3</li>
                </ul>
              </Col>
            </Row>
            <div className={classes.BottomInfo}>
              <Divider className={classes.FooterDivider} />
              <Row type="flex" justify="space-between" className={classes.FooterInfo}>
                <Col>
                  Wykonanie&nbsp;
                  <a href="http://aircode.tech">Aircode</a>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Layout.Footer>
    );
  }
}

export default injectSheet(styles)(PageFooter);
