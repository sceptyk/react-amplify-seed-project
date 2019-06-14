import { Button, Checkbox, Col, Divider, Form, Icon, Input, Row } from 'antd';
import React, { Component } from 'react';

import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';
import Spacer from 'components/spacer/Spacer';
import injectSheet from 'react-jss';
import styles from './SignIn.style';

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null
    };
  }

  renderError = () => {
    const { error } = this.state;
    if (error) {
      switch (error.code) {
        case 'UserNotFoundException':
        case 'NotAuthorizedException':
          return 'User was not found.';
        default:
          return 'There was an unexpected exception.';
      }
    }
  };

  handleSubmit = e => {
    this.setState({ loading: true });
    this.props.form.validateFields(async (error, values) => {
      if (!error) {
        try {
          await Auth.signIn(values.username, values.password);
          this.setState({ loading: false });
          this.props.history.push(this.props.redirect);
        } catch (error) {
          this.setState({ error });
        }
      }
    });
  };

  render() {
    const { error, loading } = this.state;
    const { classes, form } = this.props;

    return (
      <Row type="flex" justify="center">
        <Col span={15}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item validateStatus={error ? 'error' : !!form.getFieldError('username') ? 'error' : null}>
              {form.getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Email cannot be empty'
                  }
                ]
              })(
                <Input
                  size="small"
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Email"
                />
              )}
            </Form.Item>
            <Spacer />
            <Form.Item
              validateStatus={error ? 'error' : !!form.getFieldError('password') ? 'error' : null}
              help={this.renderError()}
            >
              {form.getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: 'Password cannot be empty'
                  }
                ]
              })(
                <Input
                  size="small"
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="Password"
                />
              )}
            </Form.Item>
            <Spacer size="small" />
            <Row type="flex" justify="space-between" align="middle">
              <Col>
                <Form.Item>
                  {form.getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true
                  })(<Checkbox>Remember me</Checkbox>)}
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
                  <Link to={'/auth/reset'}>Forgot password</Link>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button htmlType="submit" className={classes.logIn} type="primary" loading={loading}>
                    Log in
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
        <Spacer size="small" />
        <Col span={15}>
          <Divider>or</Divider>
        </Col>
        <Col>
          <Row type="flex" justify="center" align="middle">
            <Col>Don't have an account yet?</Col>
            <Col span={24} className={classes.registerButton}>
              <Link to={'/auth/signup'}>
                <Button>Sign up</Button>
              </Link>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Form.create({ name: 'SignIn' })(injectSheet(styles)(SignIn));
