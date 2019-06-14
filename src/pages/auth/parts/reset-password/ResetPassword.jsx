import { NewPassword, RequestReset } from './parts';
import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

class ResetPassword extends Component {
  render() {
    return (
      <Switch>
        <Redirect exact from="/auth/reset" to="/auth/reset/email" />
        <Route path="/auth/reset/email" component={RequestReset} />
        <Route path="/auth/reset/new" component={NewPassword} />
      </Switch>
    );
  }
}

export default ResetPassword;
