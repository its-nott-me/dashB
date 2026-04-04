import app from "./app.js";
import { env } from "./config/loadenv.js";

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} environment`);
})