# AI 3D

Text to 3D experiment using GPT-4 using premitive shapes with rotation / translation / scale, see live version on https://3dgenie.xyz

## Setup

1. Install dependency
   ```$ npm install```

2. Make a copy of the example environment variables file
   ```
   $ cp .env.example .env
   ```
   
3. Add your API key and MongoDB info to the newly created `.env` file

4. [Optional] set FEW_SHOT_MODE in your .env file.

   `FEW_SHOT_MODE=0` will generate results using no example input.
   `FEW_SHOT_MODE=1` will generate results using a hardcoded set of example input.
   `FEW_SHOT_MODE=2` will generate results using example inputs that is the most relevant to the object.
   
   If this value is not set, with each request it will randomly pick a mode so that users can get a variety of results.

5. Reset DB (Run this once during initial setup. You can also re-run it but note that this will clear out your existing db).
   ```
   $ npm run reset-db
   ```

6. Run the app
   ```
   $ npm run dev
   ```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000)!

Also see [http://localhost:3000/advanced](http://localhost:3000/advanced) for an advanced view where you can see and modify chatGPT's response.
