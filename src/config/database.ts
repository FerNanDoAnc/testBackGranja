import { DataSource } from "typeorm";

import { Task } from "../entity/Task";

export default new DataSource({ 
  type: 'mysql',
  host: 'containers-us-west-182.railway.app',
  port: 7173,
  username: 'root', 
  password: '7hdwaY7J4MXtpueO7Ewn',
  database: 'railway',
  entities: [Task],
  synchronize: true,
  logging: false
});
