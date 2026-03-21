import app from './app';
import { config } from './env';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});