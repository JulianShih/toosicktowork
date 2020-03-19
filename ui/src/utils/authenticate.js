import { Buffer } from 'buffer';

const authenticate = (auth) => {
    const user = {
        username: '',
        password: '',
    };
    [user.username, user.password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    return user;
};

export default authenticate;
