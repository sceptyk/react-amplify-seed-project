import React, { Component } from 'react';
import { Route, Router, Switch } from 'react-router-dom';

import Amplify from 'aws-amplify';
import ConfigManager from 'config';
import Home from 'pages/home/Home';
import { ThemeProvider } from 'react-jss';
import theme from 'theme';

const config = ConfigManager.get();
Amplify.configure(config);

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route path="/" component={Home} />
          </Switch>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
