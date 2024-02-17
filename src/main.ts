import { Client } from "pg";
import Express from "express";

const app = Express();
const port = 8080;
app.use(Express.json());

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    port: 5432
});
async function connectToDB(): Promise<void> {
    await client.connect();
    console.log('Connected to DB');
}

connectToDB();

app.get('/createTable/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9]/g, '');
        const result = await client.query(`
        CREATE TABLE IF NOT EXISTS ${sanitizedTableName} (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
        console.log(result);
        return res.json({ message: 'Table created' });
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Table creation failed', error: err });
    }
});

app.delete('/deleteTable/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9]/g, '');
        const result = await client.query(`DROP TABLE
        ${sanitizedTableName};`);
        console.log(result);
        return res.json({ message: 'Table deleted' });
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Table deletion failed', error: err });
    }
});

app.get('/getTables', async (req, res) => {
    try {
        const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
        console.log(result);
        return res.json(result.rows);
    } catch (err) {
        console.log(err);
        return res.json({ message: 'Table fetch failed', error: err });
    }
});

app.post('/addUser/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const { username, email, password } = req.body;
    try {
        await client.query(`INSERT INTO ${tableName} (username, email, password) VALUES ($1, $2, $3);`, [username, email, password]);
        return res.json({ message: 'User added' });
    } catch (err) {
        console.log(err);
        return res.json({ message: 'User addition failed', error: err });
    }
});

app.get('/getUsers/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9]/g, '');
    try {
        const result = await client.query(`SELECT * FROM ${sanitizedTableName};`);
        console.log(result);
        return res.json(result.rows);
    } catch (err) {
        console.log(err);
        return res.json({ message: 'User fetch failed', error: err });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
