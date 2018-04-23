import jwt from 'jsonwebtoken';
import config from '../config';


const decode = token => jwt.decode(token);

const verify = (token, cb) => jwt.verify(token, config.OAUTH_PUBLIC_KEY, cb);

export { verify, decode };
