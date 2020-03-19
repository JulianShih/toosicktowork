import React from 'react';
import { shallow } from 'enzyme';

import Users from './Users';

describe('Users', () => {
    it('change state when clicked add user button', () => {
        const users = shallow(<Users />);
        users.setState({ username: 'root' });
        users.find('.add-user-button').simulate('click');
        expect(users.state().currentState).toEqual('adding');
    });
    it('change state when clicked delete user button', () => {
        const users = shallow(<Users />);
        users.setState({ username: 'root' });
        users.find('.delete-user-button').simulate('click');
        expect(users.state().currentState).toEqual('deleting');
    });
});
