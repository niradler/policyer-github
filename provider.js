const fs = require("fs");
const { Provider } = require("policyer");

class GithubProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    const events = JSON.parse(
      fs.readFileSync(
        process.env.GITHUB_EVENT_PATH || "events/example.json",
        "utf8"
      )
    );
    const githubEnv = Object.keys(process.env).reduce((acc, key) => {
      if (key.startsWith("GITHUB_")) {
        acc[key] = process.env[key];
      }
      return acc;
    }, {});
    if (!events.env) events.env = githubEnv;
    if (process.env.INPUT_VERBOSE === "true")
      console.log("events", JSON.stringify(events));
    return events;
  }

  async evaluate({ configuration, checks }) {
    if (configuration.type == "github") {
      const todo = await this.collect(configuration);
      const report = this.evaluateChecks(todo, checks);

      return report;
    } else {
      throw new Error("Not a valid check.");
    }
  }
}

module.exports = GithubProvider;
