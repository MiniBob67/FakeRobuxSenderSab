const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

/*
==================================================
CORS
==================================================
*/

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


/*
==================================================
KEY SYSTEM
==================================================
*/

const keys = new Map();

/*
  key -> {
    expiresAt: timestamp albo null
  }
*/


app.post("/api/keys", (req, res) => {

  const {
    key,
    duration
  } = req.body;


  if (!key || !duration) {

    return res.status(400).json({
      success: false,
      message: "Missing key or duration."
    });

  }


  const durations = {

    "12h":
      12 * 60 * 60 * 1000,

    "1d":
      24 * 60 * 60 * 1000,

    "3d":
      3 * 24 * 60 * 60 * 1000,

    "1w":
      7 * 24 * 60 * 60 * 1000,

    "1m":
      30 * 24 * 60 * 60 * 1000,

    "1y":
      365 * 24 * 60 * 60 * 1000,

    "lifetime":
      null

  };


  if (
    !Object.prototype.hasOwnProperty.call(
      durations,
      duration
    )
  ) {

    return res.status(400).json({
      success: false,
      message: "Invalid duration."
    });

  }


  const expiresAt =
    durations[duration] === null
      ? null
      : Date.now() + durations[duration];


  keys.set(
    key,
    {
      expiresAt
    }
  );


  console.log(
    `Key created: ${key} | Duration: ${duration}`
  );


  res.json({
    success: true
  });

});


app.post("/api/verify", (req, res) => {

  const {
    key
  } = req.body;


  if (
    !key ||
    typeof key !== "string"
  ) {

    return res.json({
      valid: false
    });

  }


  const keyData =
    keys.get(key);


  if (!keyData) {

    return res.json({
      valid: false
    });

  }


  if (
    keyData.expiresAt === null
  ) {

    return res.json({
      valid: true,
      expiresAt: null
    });

  }


  if (
    Date.now() >=
    keyData.expiresAt
  ) {

    keys.delete(key);


    console.log(
      `Key expired: ${key}`
    );


    return res.json({
      valid: false,
      expired: true
    });

  }


  res.json({
    valid: true,
    expiresAt:
      keyData.expiresAt
  });

});


/*
==================================================
ROBLOX USER SEARCH
==================================================
*/

app.post(
  "/api/roblox/search",
  async (req, res) => {

    try {

      const username =
        String(
          req.body?.username || ""
        ).trim();


      if (
        username.length < 1
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Username is required."
        });

      }


      /*
      ------------------------------------------
      EXACT USERNAME SEARCH
      ------------------------------------------
      */

      const exactResponse =
        await fetch(
          "https://users.roblox.com/v1/usernames/users",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json"
            },

            body: JSON.stringify({

              usernames: [
                username
              ],

              excludeBannedUsers:
                false

            })
          }
        );


      if (!exactResponse.ok) {

        throw new Error(
          "Roblox exact username request failed: " +
          exactResponse.status
        );

      }


      const exactData =
        await exactResponse.json();


      let users = [];


      /*
      Exact match found
      */

      if (
        exactData.data &&
        Array.isArray(
          exactData.data
        ) &&
        exactData.data.length > 0
      ) {

        users =
          exactData.data.map(
            user => ({
              id:
                user.id,

              name:
                user.name,

              displayName:
                user.displayName,

              requestedUsername:
                user.requestedUsername
            })
          );

      }


      /*
      ------------------------------------------
      NORMAL SEARCH
      ------------------------------------------
      */

      try {

        const searchResponse =
          await fetch(
            "https://users.roblox.com/v1/users/search" +
            "?keyword=" +
            encodeURIComponent(username) +
            "&limit=10"
          );


        if (searchResponse.ok) {

          const searchData =
            await searchResponse.json();


          if (
            searchData.data &&
            Array.isArray(
              searchData.data
            )
          {

            for (
              const user
              of searchData.data
            ) {

              const alreadyExists =
                users.some(
                  existing =>
                    existing.id ===
                    user.id
                );


              if (!alreadyExists) {

                users.push({

                  id:
                    user.id,

                  name:
                    user.name,

                  displayName:
                    user.displayName

                });

              }

            }

          }

        }

      } catch (searchError) {

        console.log(
          "Normal Roblox search failed:",
          searchError.message
        );

      }


      /*
      ------------------------------------------
      LIMIT RESULTS
      ------------------------------------------
      */

      users =
        users.slice(0, 10);


      /*
      ------------------------------------------
      GET AVATARS
      ------------------------------------------
      */

      const avatarMap = {};


      if (users.length > 0) {

        const ids =
          users
            .map(user => user.id)
            .join(",");


        const avatarResponse =
          await fetch(
            "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
            "?userIds=" +
            encodeURIComponent(ids) +
            "&size=150x150" +
            "&format=Png" +
            "&isCircular=false"
          );


        if (avatarResponse.ok) {

          const avatarData =
            await avatarResponse.json();


          if (
            avatarData.data &&
            Array.isArray(
              avatarData.data
            )
          ) {

            avatarData.data.forEach(
              avatar => {

                avatarMap[
                  avatar.targetId
                ] =
                  avatar.imageUrl;

              }
            );

          }

        }

      }


      /*
      ------------------------------------------
      FINAL RESPONSE
      ------------------------------------------
      */

      users =
        users.map(user => ({

          id:
            user.id,

          name:
            user.name,

          displayName:
            user.displayName,

          requestedUsername:
            user.requestedUsername,

          avatar:
            avatarMap[user.id] || ""

        }));


      console.log(
        `Roblox search: "${username}" -> ${users.length} result(s)`
      );


      res.json({

        success: true,

        users

      });


    } catch (error) {

      console.error(
        "Roblox search error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Could not search Roblox users."

      });

    }

  }
);


/*
==================================================
TEST
==================================================
*/

app.get("/", (req, res) => {

  res.send(
    "BotKeySystem server is online."
  );

});


/*
==================================================
START SERVER
==================================================
*/

app.listen(
  PORT,
  () => {

    console.log(
      `Key server running on http://localhost:${PORT}`
    );

    console.log(
      "Roblox search API ready."
    );

  }
);
