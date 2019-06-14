import React, { Component } from 'react';

import { Auth } from 'aws-amplify';

class PrivateLink extends Component {
  handleClick = async () => {
    const user = await Auth.currentAuthenticatedUser();
    if (user) {
      this.props.history.push(this.props.to);
    } else {
      this.props.history.push('/signup');
    }
  };

  render() {
    const { children } = this.props;

    return <div onClick={this.handleClick}>{children}</div>;
  }
}
export default PrivateLink;
