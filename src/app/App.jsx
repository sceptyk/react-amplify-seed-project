import { Col, Layout, Row } from 'antd';
import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import Amplify from 'aws-amplify';
import AuthPage from 'pages/auth/Auth';
import ConfigManager from 'config';
import DashboardPage from 'pages/dashboard/Dashboard';
import HomePage from 'pages/home/Home';
import PageFooter from 'components/page-footer/PageFooter';
import PageHeader from 'components/page-header/PageHeader';
import PrivateRoute from 'components/private-route/PrivateRoute';
import { ThemeProvider } from 'react-jss';
import theme from './App.theme';

const config = ConfigManager.get();
Amplify.configure(config);

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/auth" exact component={AuthPage} />
            <Route
              path="/"
              render={() => (
                <Row type="flex" justify="center">
                  <Col xs={24} xl={22} xxl={20}>
                    <PageHeader />
                    <Layout.Content>
                      <Switch>
                        <Route path="/" exact component={HomePage} />
                        <PrivateRoute path="/dashboard" exact component={DashboardPage} />
                      </Switch>
                    </Layout.Content>
                    <PageFooter />
                  </Col>
                </Row>
              )}
            />
          </Switch>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
