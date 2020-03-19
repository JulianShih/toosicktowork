import React from 'react';
import { shallow } from 'enzyme';

import Leaves from './Leaves';

describe('Leaves', () => {
    const leaves = shallow(<Leaves />);
    it('change state when clicked approve list button', () => {
        leaves.setState({ username: 'root' });
        leaves.find('.approve-leaves').simulate('click');
        expect(leaves.state().currentState).toEqual('pending');
        leaves.find('.back-to-leaves').simulate('click');
        expect(leaves.state().currentState).toEqual('');
    });
    it('change state when clicked add leave button', () => {
        leaves.setState({ username: 'root' });
        leaves.find('.add-leave-button').simulate('click');
        expect(leaves.state().currentState).toEqual('adding');
    });
});
