import constants from '../../src/util/constants';
import { findFreePorts } from 'find-free-ports';

(constants.webServer.defaultPort as any) = async () => {
    const [port] = await findFreePorts(1);
    return port;
};

module.exports = constants;
