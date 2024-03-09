const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Routing
  if (path === "/") { // Homepage route
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("Hello Welcome to the Homepage");
  } else if (path === "/create" && req.method === "GET") { // Display form for creating user
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<form action="/add" method="post"><input type="text" name="userName" placeholder="user name" /><button type="submit">Submit</button></form>`
    );
  } else if (path === "/add" && req.method === "POST") { // Add user route
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      // Parse form data
      const formData = querystring.parse(body);
      const userName = formData.userName;

      // Append user to file
      fs.appendFile("users.txt", userName + "\n", (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("Error adding user.");
          return;
        }
        console.log("User added!");
        // Redirect to users route after adding user
        res.writeHead(302, { Location: "/users" });
        res.end();
      });
    });
  } else if (path === "/users" && req.method === "GET") { // Display list of users route
    fs.readFile("users.txt", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        // Redirect to create route if users file not found
        res.writeHead(302, { Location: "/create" });
        res.end();
        return;
      }
      const users = data.split("\n").filter((user) => user.trim() !== "");
      if (users.length === 0) {
        // Redirect to create route if no users found
        res.writeHead(302, { Location: "/create" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(users.join("<br>")); // Display users list
    });
  } else {
    // 404 Not Found for all other routes
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 - Not Found</h1>");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
