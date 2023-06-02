const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());
const bcrypt = require("bcrypt");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.post("/register/", async (request, response) => {
  let { username, name, password, gender, location } = request.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  let getuser = `SELECT * FROM user WHERE username  = '${username}';`;
  let data = await database.get(getuser);

  //   switch (true) {
  //     case data === undefined:
  //       if (password.length < 5) {
  //         response.status = 400;
  //         response.send("Password is too short");
  //       } else {
  //         const createUserQuery = `
  //       INSERT INTO
  //         user (username, name, password, gender, location)
  //       VALUES
  //         (
  //           '${username}',
  //           '${name}',
  //           '${hashedPassword}',
  //           '${gender}',
  //           '${location}'
  //         )`;
  //         let result = await database.run(createUserQuery);
  //         const newUserId = result.lastID;
  //         response.status = 200;
  //         response.send("User created successfully");
  //       }
  //       break;
  //     case data !== undefined:
  //       response.status = 400;
  //       response.send("User already exists");
  //       break;
  //   }

  if (data === undefined) {
    const createUserQuery = `
    INSERT INTO
      user (username, name, password, gender, location)
    VALUES
      (
        '${username}',
        '${name}',
        '${hashedPassword}',
        '${gender}',
        '${location}'
      )`;
    if (password.length < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      let result = await database.run(createUserQuery);
      const newUserId = result.lastID;
      response.status = 200;
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;

  const query = `SELECT * FROM user WHERE username = '${username}';`;

  let data = await database.get(query);

  if (data === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    let passwordmatch = await bcrypt.compare(password, data.password);

    if (passwordmatch === true) {
      response.status = 200;
      response.send("Login success!");
    } else {
      response.status = 400;
      response.send("Invalid password");
    }
  }
});

app.put("/change-password/", async (request, response) => {
  let { username, oldPassword, newPassword } = request.body;

  let query = `SELECT * FROM user WHERE username = '${username}';`;

  let data = await database.get(query);
  //   let passwordmatch = await bcrypt.compare(oldPassword, data.password);

  //   if (passwordmatch === false) {
  //     response.status = 400;
  //     response.send("Invalid current password");
  //   } else {
  //     if (newPassword.length < 5) {
  //       response.status = 400;
  //       response.send("Password is too short");
  //     } else {
  //       const hashedpassword = await bcrypt.hash(newPassword, 10);
  //       let queryfornewpass = `UPDATE user SET password = '${hashedpassword}' WHERE username = '${username}'`;

  //       let data = await database.run(queryfornewpass);
  //       response.status = 200;
  //       response.send("Password updated");
  //     }
  //   }

  if (data === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    let passwordmatch = await bcrypt.compare(oldPassword, data.password);

    if (passwordmatch === true) {
      if (newPassword.length < 5) {
        response.status = 400;
        response.send("Password is too short");
      }
      //   response.status = 400;
      //   response.send("Invalid current password");
      else {
        //   if (newPassword.length < 5) {
        //     response.status = 400;
        //     response.send("Password is too short");

        const hashedpassword = await bcrypt.hash(newPassword, 10);
        let queryfornewpass = `UPDATE user SET password = '${hashedpassword}' WHERE username = '${username}'`;
        await database.run(queryfornewpass);
        response.status = 200;
        response.send("Password updated");
      }
    } else {
      response.status = 400;
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
