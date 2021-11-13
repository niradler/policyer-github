const fs = require("fs");
const { Provider } = require("policyer");

class GithubProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    const events = fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8");
    console.log("events", events);
    const githubEnv = Object.keys(process.env).reduce((acc, key) => {
      if (key.startsWith("GITHUB_")) {
        acc[key] = process.env[key];
      }
      return acc;
    }, {});
    console.log("githubEnv", githubEnv);
    return githubEnv;
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
