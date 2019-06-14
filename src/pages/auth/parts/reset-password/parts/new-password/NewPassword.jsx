import * as queryString from 'query-string';

import { Button, Col, Form, Icon, Input, Row } from 'antd';
import React, { Component } from 'react';

import { Auth } from 'aws-amplify';
import Spacer from 'components/spacer/Spacer';
import { withRouter } from 'react-router-dom';

class NewPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      code: null,
      password: null,
      error: null
    };
  }

  componentDidMount = () => {
    const search = queryString.parse(this.props.location.search);
    this.setState({ user: search.user });
  };

  handleSubmit = () => {
    this.props.form.validateFields(async (error, values) => {
      if (!error) {
        const { email } = this.state;
        try {
          await Auth.forgotPasswordSubmit(email, values.code, values.password);
        } catch (error) {
          this.setState({ error });
        }
      }
    });
  };

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Row type="flex" justify="center">
          <Col span={15}>
            <Input size="small" id="email" onChange={this.handleChange} placeholder="Email" />
          </Col>
          <Col span={15}>
            <Input size="small" id="code" onChange={this.handleChange} placeholder="Verification code" />
          </Col>
          <Col span={15}>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: 'Password cannot be empty'
                  }
                ]
              })(
                <Input
                  size="small"
                  id="password"
                  onChange={this.handleChange}
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="New password"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Reset password
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default withRouter(Form.create({ name: 'NewPassword' })(NewPassword));
