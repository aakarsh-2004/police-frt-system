import app from './src/app';
import { config } from './src/config/config';


const startServer = async () => {
    const port = config.port || 6969;

    app.listen(port, () => {
        console.log(`${new Date()}: Listening on port ${port}`);
    });
};

startServer();