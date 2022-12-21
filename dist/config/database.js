"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Task_1 = require("../entity/Task");
exports.default = new typeorm_1.DataSource({
    type: 'mysql',
    host: 'containers-us-west-182.railway.app',
    port: 7173,
    username: 'root',
    password: '7hdwaY7J4MXtpueO7Ewn',
    database: 'railway',
    entities: [Task_1.Task],
    synchronize: true,
    logging: false
});
