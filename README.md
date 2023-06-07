# AI 3D

Text to 3D experiment using GPT-4

## Setup

1. Install dependency
   ```$ npm install```

2. Make a copy of the example environment variables file
   ```
   $ cp .env.example .env
   ```
   
3. Add your API key and MongoDB info to the newly created `.env` file

4. Reset DB (Run this once during initial setup. You can also re-run it but note that this will clear out your existing db).
   ```
   $ npm run reset-db
   ```

5. Run the app
   ```
   $ npm run dev
   ```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000)!
