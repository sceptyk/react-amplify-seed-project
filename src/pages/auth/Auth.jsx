import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ResetPassword, SignIn, SignUp } from './parts';

import { Modal } from 'antd';

class Auth extends Component {
  render() {
    const { classes } = this.props;

    return (
      <Modal destroyOnClose visible maskClosable={false} title={'Sign in'} onCancel={this.handleClose} footer={null}>
        <Switch>
          <Redirect exact from="/auth" to="/auth/signin" />
          <Route path="/auth/signin" component={SignIn} />
          <Route path="/auth/signup" component={SignUp} />
          <Route path="/auth/reset" component={ResetPassword} />
        </Switch>
      </Modal>
    );
  }
}

export default Auth;
