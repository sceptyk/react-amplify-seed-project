import { Col, Layout, Menu, Row } from 'antd';
import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import PrivateLink from 'components/private-link/PrivateLink';
import StyledButton from 'styled/styled-button/StyledButton';
import injectSheet from 'react-jss';
import logoSrc from 'images/logo_manager_colour.svg';
import styles from './PageHeader.style';
import { withRouter } from 'react-router-dom';

const { Header } = Layout;
class PageHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: []
    };
  }

  componentDidMount() {
    this.setLocation();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setLocation();
    }
  }

  setLocation = () => {
    this.setState({
      selectedItem: [this.props.location.pathname.split('/')[1]]
    });
  };

  render() {
    const { classes } = this.props;
    const { selectedItem } = this.state;

    return (
      <Header className={classes.header}>
        <Row type="flex" justify="center">
          <Col span={20}>
            <Menu mode="horizontal" selectedKeys={selectedItem} onSelect={this.onSelect}>
              <Menu.Item className={classes.logoMenuItem} key="home">
                <Link to={'/'}>
                  <Row type="flex" align="middle">
                    <Col className={classes.logo}>
                      <img src={logoSrc} />
                    </Col>
                    <Col className={classes.title}>FITER MANAGER</Col>
                  </Row>
                </Link>
              </Menu.Item>
              <Menu.Item className={classes.MyAccount} key="dasboard">
                <PrivateLink to="/dashboard">Dashboard</PrivateLink>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
      </Header>
    );
  }
}

export default withRouter(injectSheet(styles)(PageHeader));
