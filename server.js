const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;
app.use(express.static("test"));
app.get("/", function(req, res) {
  res.sendFile("vertical_playground.html", function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});
app.listen(port, () => console.log(`Listening on port ${port}`));
