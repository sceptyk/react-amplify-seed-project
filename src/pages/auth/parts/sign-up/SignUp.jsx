import { Button, Checkbox, Col, Form, Icon, Input, Row } from 'antd';
import React, { Component } from 'react';

import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';
import Spacer from 'components/spacer/Spacer';
import injectSheet from 'react-jss';
import logoSrc from 'images/logo_manager_colour.svg';
import styles from './SignUp.style';

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  handleSubmit = () => {
    this.props.form.validateFields(async (error, values) => {
      if (!error) {
        try {
          await Auth.signUp({
            username: values.username,
            password: values.password,
            attributes: {
              name: values.name,
              family_name: values.surname,
              email: values.username
            }
          });
        } catch (error) {
          this.setState({ error });
        }
      }
    });
  };

  render() {
    const { classes, form } = this.props;
    const { error } = this.state;

    return (
      <Row type="flex" align="middle" justify="center">
        <Col span={24}>
          <Link to={'/'}>
            <img src={logoSrc} className={classes.logo} />
          </Link>
        </Col>
        <Col xs={24} sm={20} md={18} lg={16} xl={14} className={classes.paper}>
          <Row type="flex" align="middle" justify="center">
            <Col xs={22} sm={20} md={18} xxl={16}>
              <Form onSubmit={this.handleSubmit}>
                <Form.Item
                  validateStatus={error ? 'error' : !!form.getFieldError('username') ? 'error' : null}
                  help={this.renderError()}
                >
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
                <Form.Item>
                  {form.getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: 'Password cannot be empty'
                      },
                      {
                        validator: this.validateToNextPassword
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
                <Spacer />
                <Form.Item>
                  {form.getFieldDecorator('terms', {
                    valuePropName: 'checked',
                    rules: [
                      {
                        required: true,
                        transform: value => value || undefined,
                        type: 'boolean',
                        message: 'You need to accept terms of the service.'
                      }
                    ]
                  })(
                    <Checkbox className={classes.agreementWrapper}>
                      I accept
                      <Link to="/terms/conditions">terms of service</Link>
                      and
                      <Link to="/terms/privacy">privacy policy</Link>
                    </Checkbox>
                  )}
                </Form.Item>
                <Spacer />
                <Form.Item className={classes.registerWrapper}>
                  <Button htmlType="submit" type="primary">
                    Sign up
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Form.create({ name: 'SignUp' })(injectSheet(styles)(SignUp));
