import React from 'react';
import { shallow } from 'enzyme';

import renderer from 'react-test-renderer';

import Login from './Login';

describe('Login', () => {
    it('renders login page correctly', () => {
        const tree = renderer
            .create(<Login />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('change state when input changes', () => {
        const login = shallow(<Login />);
        login.find('.login-container input[type="text"]').simulate('change', { target: { value: 'test' } });
        login.find('.login-container input[type="password"]').simulate('change', { target: { value: 'test' } });
        expect(login.state().username).toEqual('test');
        expect(login.state().password).toEqual('test');
    });
});
