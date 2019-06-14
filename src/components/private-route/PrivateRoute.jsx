import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';

import { Auth } from 'aws-amplify';

class PrivateRoute extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  isAuthenticated = async () => {
    const user = await Auth.currentAuthenticatedUser();
    return !!user;
  };

  render() {
    const { component, state, ...rest } = this.props;

    return this.isAuthenticated() ? <Route {...rest} component={component} /> : <Redirect to="/" />;
  }
}

export default PrivateRoute;
