import * as queryString from 'query-string';

import { Button, Col, Form, Input, Row } from 'antd';
import React, { Component } from 'react';

import { Auth } from 'aws-amplify';

class RequestReset extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      email: null
    };
  }

  renderError = () => {
    const { error } = this.state;
    if (error) {
      switch (error.code) {
        case 'LimitExceededException':
          return 'Try again in few minutes.';
        case 'UserNotFoundException':
          return 'User does not exist.';
        default:
          return 'There was an unexpected exception.';
      }
    }
  };

  handleChange = event => {
    this.setState({
      email: event.target.value
    });
  };

  handleNext = async () => {
    const { email } = this.state;
    try {
      await Auth.forgotPassword(email);

      const search = queryString.stringify({
        user: email
      });
      this.props.history.push(`/auth/reset/new?${search}`);
    } catch (error) {
      this.setState({ error });
    }
  };

  render() {
    const { error } = this.state;

    return (
      <Row type="flex" justify="center">
        <Col span={15}>
          <Row type="flex" justify="center">
            <Col span={24}>
              <Form>
                <Form.Item validateStatus={error ? 'error' : null} help={this.renderError()}>
                  <Input id="email" size="small" onChange={this.handleChange} placeholder="Email" />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Button onClick={this.handleNext}>Next</Button>
        </Col>
      </Row>
    );
  }
}

export default RequestReset;
